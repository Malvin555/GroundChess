import type { Server as NetServer } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer, Socket } from "socket.io";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & { io?: IOServer };
  };
};

type Player = {
  socketId: string;
  userId: string;
};

type GameRoom = {
  white?: Player;
  black?: Player;
};

const games = new Map<string, GameRoom>();

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket,
) {
  if (!res.socket.server.io) {
    console.log("🟢 Initializing Socket.IO server...");
    const io = new IOServer(res.socket.server, {
      path: "/api/socket",
      cors: { origin: "*", methods: ["GET", "POST"] },
    });

    res.socket.server.io = io;

    io.on("connection", (socket: Socket) => {
      console.log("🧑 Connected:", socket.id);

      socket.on(
        "join-game",
        ({ gameId, userId }: { gameId: string; userId: string }) => {
          console.log(`🔗 Player ${userId} joined ${gameId}`);

          let game = games.get(gameId);

          if (!game) {
            game = {};
            games.set(gameId, game);
          }

          // Prevent duplicate assignments
          const isAlreadyWhite = game.white?.userId === userId;
          const isAlreadyBlack = game.black?.userId === userId;

          if (isAlreadyWhite) {
            game.white.socketId = socket.id;
            socket.emit("assign-color", "w");
            console.log("♟ Reconnected as White");
          } else if (isAlreadyBlack) {
            game.black.socketId = socket.id;
            socket.emit("assign-color", "b");
            console.log("♟ Reconnected as Black");
          } else if (!game.white) {
            game.white = { socketId: socket.id, userId };
            socket.emit("assign-color", "w");
            console.log("🧍 Assigned as White");
          } else if (!game.black) {
            game.black = { socketId: socket.id, userId };
            socket.emit("assign-color", "b");
            console.log("🧍 Assigned as Black");

            // Game ready!
            io.to(gameId).emit("game-ready", {
              whiteId: game.white.userId,
              blackId: game.black.userId,
            });
          } else {
            socket.emit("assign-color", "spectator");
            console.log("👁 Assigned as Spectator (room full)");
          }

          socket.join(gameId);
          console.log("📦 Game room state:", {
            white: game.white?.userId,
            black: game.black?.userId,
          });
        },
      );

      socket.on("move", ({ gameId, move }) => {
        socket.to(gameId).emit("opponent-move", move);
      });

      socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);

        for (const [gameId, game] of games.entries()) {
          let updated = false;

          if (game.white?.socketId === socket.id) {
            console.log("⚪ White player disconnected");
            delete game.white;
            updated = true;
          } else if (game.black?.socketId === socket.id) {
            console.log("⚫ Black player disconnected");
            delete game.black;
            updated = true;
          }

          if (updated) {
            games.set(gameId, game);
            // Notify remaining player
            const remaining = game.white || game.black;
            if (remaining) {
              io.to(gameId).emit("opponent-disconnected");
            }
          }

          // Clean up empty games
          if (!game.white && !game.black) {
            games.delete(gameId);
            console.log(`🗑 Deleted empty room: ${gameId}`);
          }
        }
      });
    });
  }

  res.end();
}
