"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// socket-server.ts
import http from "http";
import express from "express";
import { Server } from "socket.io";
import next from "next";
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const games = new Map();
app.prepare().then(() => {
  const expressApp = express();
  const server = http.createServer(expressApp);
  const io = new Server(server, {
    cors: {
      origin: "*", // or use actual origin like "http://localhost:3000"
    },
  });
  io.on("connection", (socket) => {
    console.log("Client connected");
    socket.on("join-game", ({ gameId, user }) => {
      let game = games.get(gameId);
      if (!game) {
        game = { white: user, black: null, moves: [] };
        games.set(gameId, game);
        socket.join(gameId);
        socket.emit("color", "white");
        socket.emit("opponent-id", null);
      } else if (!game.black && game.white.userId !== user.userId) {
        game.black = user;
        socket.join(gameId);
        socket.emit("color", "black");
        socket.emit("opponent-id", game.white.userId);
        socket.to(gameId).emit("opponent-id", user.userId);
        socket.to(gameId).emit("start-game", game);
      } else {
        socket.emit("error", "Game full or invalid");
      }
    });
    socket.on("move", ({ gameId, move }) => {
      const game = games.get(gameId);
      if (game) {
        game.moves.push(move);
        socket.to(gameId).emit("opponent-move", move);
      }
    });
    socket.on("game-over", ({ gameId, result }) => {
      io.to(gameId).emit("end", result);
    });
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
  expressApp.all("*", (req, res) => handle(req, res));
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`✅ Server ready on http://localhost:${PORT}`);
  });
});
