import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { Chess } from "chess.js";
import { PrismaClient } from "@prisma/client";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const prisma = new PrismaClient();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(server, {
    path: "/socket.io",
    transports: ["websocket"],
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("joinGame", async ({ gameId, userId }) => {
      console.log(`User ${userId} attempting to join game ${gameId}`);

      try {
        const game = await prisma.game.findUnique({
          where: { gameId: gameId },
          select: {
            id: true,
            gameId: true,
            playerWhiteId: true,
            playerBlackId: true,
            status: true,
            fen: true,
            currentTurn: true,
            moves: true,
            startTime: true,
            playerWhite: { select: { username: true, id: true } },
            playerBlack: { select: { username: true, id: true } },
          },
        });

        if (!game) {
          console.log(`Game ${gameId} not found.`);
          socket.emit("gameError", "Game not found.");
          return;
        }

        if (game.playerWhiteId !== userId && game.playerBlackId !== userId) {
          console.log(`User ${userId} is not a player in game ${gameId}.`);
          socket.emit("gameError", "You are not authorized to join this game.");
          return;
        }

        socket.join(gameId);
        console.log(`User ${userId} joined socket room for game ${gameId}`);

        // Auto-start the game if both players are present and status is waiting
        let gameStatus = game.status;
        if (
          game.playerWhiteId &&
          game.playerBlackId &&
          game.status === "waiting"
        ) {
          gameStatus = "playing";
          await prisma.game.update({
            where: { id: game.id },
            data: {
              status: "playing",
              startTime: new Date(),
            },
          });
        }

        const gameJoinedData = {
          gameId: game.gameId,
          playerWhiteId: game.playerWhiteId,
          playerBlackId: game.playerBlackId,
          status: gameStatus,
          fen: game.fen,
          currentTurn: game.currentTurn,
          moves: game.moves,
          startTime: game.startTime,
          playerWhiteUsername: game.playerWhite?.username,
          playerBlackUsername: game.playerBlack?.username,
          yourColor: game.playerWhiteId === userId ? "white" : "black",
        };

        socket.emit("gameJoined", gameJoinedData);

        // Check if the game has started (has both players) regardless of current status
        if (game.playerWhiteId && game.playerBlackId) {
          // Send gameStarted event to each player with their specific color
          const gameStartedData = {
            gameId: game.gameId,
            playerWhiteId: game.playerWhiteId,
            playerBlackId: game.playerBlackId,
            status: gameStatus,
            fen: game.fen,
            currentTurn: game.currentTurn,
            moves: game.moves,
            startTime: game.startTime,
            playerWhiteUsername: game.playerWhite?.username,
            playerBlackUsername: game.playerBlack?.username,
          };

          // Send to all players in the room
          io.to(gameId).emit("gameStarted", gameStartedData);
        } else if (game.status === "waiting") {
          io.to(gameId).emit("playerJoined", {
            playerWhiteId: game.playerWhiteId,
            playerBlackId: game.playerBlackId,
            playerWhiteUsername: game.playerWhite?.username,
            playerBlackUsername: game.playerBlack?.username,
          });
        }
      } catch (error) {
        console.error("Error joining game:", error);
        socket.emit("gameError", "Error joining game.");
      }
    });

    socket.on("makeMove", async ({ gameId, move, userId }) => {
      console.log(`User ${userId} making move in game ${gameId}:`, move);

      try {
        const game = await prisma.game.findUnique({
          where: { gameId: gameId },
          select: {
            id: true,
            fen: true,
            currentTurn: true,
            playerWhiteId: true,
            playerBlackId: true,
            moves: true,
            status: true,
          },
        });

        if (!game || game.status !== "playing") {
          socket.emit("gameError", "Game not active or not found.");
          return;
        }

        const chess = new Chess(game.fen || undefined);
        const playerColor = game.playerWhiteId === userId ? "white" : "black";

        if (game.currentTurn !== playerColor) {
          socket.emit("gameError", "It's not your turn.");
          return;
        }

        const result = chess.move(move);
        if (result === null) {
          socket.emit("gameError", "Invalid move.");
          return;
        }

        const newFen = chess.fen();
        const newMoves = Array.isArray(game.moves)
          ? [...game.moves, move]
          : [move];
        const nextTurn = chess.turn() === "w" ? "white" : "black";

        let gameStatus = "playing";
        let winnerId = null;
        let loserId = null;
        let draw = false;

        if (chess.isCheckmate()) {
          gameStatus = "finished";
          winnerId =
            playerColor === "white" ? game.playerWhiteId : game.playerBlackId;
          loserId =
            playerColor === "white" ? game.playerBlackId : game.playerWhiteId;
          console.log(`Game ${gameId} ended by checkmate. Winner: ${winnerId}`);
        } else if (
          chess.isDraw() ||
          chess.isStalemate() ||
          chess.isThreefoldRepetition() ||
          chess.isInsufficientMaterial()
        ) {
          gameStatus = "finished";
          draw = true;
          console.log(`Game ${gameId} ended in a draw.`);
        }

        const updatedGame = await prisma.game.update({
          where: { id: game.id },
          data: {
            fen: newFen,
            currentTurn: nextTurn,
            moves: newMoves,
            status: gameStatus,
            winnerId: winnerId,
            loserId: loserId,
            draw: draw,
            endTime: gameStatus === "finished" ? new Date() : null,
          },
          include: { playerWhite: true, playerBlack: true },
        });

        const gameUpdateData = {
          fen: updatedGame.fen,
          currentTurn: updatedGame.currentTurn,
          moves: updatedGame.moves,
          status: updatedGame.status,
          winnerId: updatedGame.winnerId,
          loserId: updatedGame.loserId,
          draw: updatedGame.draw,
          endTime: updatedGame.endTime,
        };

        io.to(gameId).emit("gameUpdate", gameUpdateData);

        if (gameStatus === "finished") {
          await handleGameEnd({
            gameId: updatedGame.gameId,
            winnerId: updatedGame.winnerId,
            loserId: updatedGame.loserId,
            draw: updatedGame.draw ?? false,
          });
        }
      } catch (error) {
        console.error("Error making move:", error);
        socket.emit("gameError", "Error processing move.");
      }
    });

    socket.on("giveUp", async ({ gameId, userId }) => {
      console.log(`User ${userId} giving up in game ${gameId}`);

      try {
        const game = await prisma.game.findUnique({
          where: { gameId: gameId },
          select: {
            id: true,
            status: true,
            playerWhiteId: true,
            playerBlackId: true,
            playerWhite: { select: { username: true } },
            playerBlack: { select: { username: true } },
          },
        });

        if (!game || game.status !== "playing") {
          socket.emit("gameError", "Game not active or not found.");
          return;
        }

        let winnerId = null;
        let loserId = null;
        let resignerUsername = "";

        if (game.playerWhiteId === userId) {
          winnerId = game.playerBlackId;
          loserId = game.playerWhiteId;
          resignerUsername = game.playerWhite?.username || "White Player";
        } else if (game.playerBlackId === userId) {
          winnerId = game.playerWhiteId;
          loserId = game.playerBlackId;
          resignerUsername = game.playerBlack?.username || "Black Player";
        } else {
          socket.emit("gameError", "You are not a player in this game.");
          return;
        }

        const updatedGame = await prisma.game.update({
          where: { id: game.id },
          data: {
            status: "finished",
            winnerId: winnerId,
            loserId: loserId,
            endTime: new Date(),
          },
          include: { playerWhite: true, playerBlack: true },
        });

        io.to(gameId).emit("gameUpdate", {
          status: updatedGame.status,
          winnerId: updatedGame.winnerId,
          loserId: updatedGame.loserId,
          draw: updatedGame.draw,
          endTime: updatedGame.endTime,
          message: `${resignerUsername} resigned.`,
        });

        await handleGameEnd({
          gameId: updatedGame.gameId,
          winnerId: updatedGame.winnerId,
          loserId: updatedGame.loserId,
          draw: updatedGame.draw ?? false,
        });
      } catch (error) {
        console.error("Error processing resignation:", error);
        socket.emit("gameError", "Error processing resignation.");
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  async function handleGameEnd(game) {
    const RATING_CHANGE_WIN = 25;
    const RATING_CHANGE_LOSS = -25;

    try {
      if (game.draw) {
        console.log(`Game ${game.gameId} ended in a draw. No rating change.`);
      } else if (game.winnerId && game.loserId) {
        await prisma.$transaction([
          prisma.user.update({
            where: { id: game.winnerId },
            data: { rating: { increment: RATING_CHANGE_WIN } },
          }),
          prisma.user.update({
            where: { id: game.loserId },
            data: { rating: { increment: RATING_CHANGE_LOSS } },
          }),
        ]);
        console.log(
          `Game ${game.gameId} finished. Winner: ${game.winnerId}, Loser: ${game.loserId}. Ratings updated.`,
        );
      } else {
        console.warn(
          `Game ${game.gameId} ended without clear winner/loser/draw status for rating update.`,
        );
      }
    } catch (error) {
      console.error("Failed to update ratings after game end:", error);
    }
  }

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
