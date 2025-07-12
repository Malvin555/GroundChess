// lib/socket.ts

import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { NextApiResponse } from "next";

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & { io?: SocketIOServer };
  };
};

type RoomPlayers = {
  [roomId: string]: string[]; // socket ids
};

const roomPlayers: RoomPlayers = {};

export default function initSocket(res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    console.log("🔌 Starting Socket.IO server...");

    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("🧑 Client connected:", socket.id);

      socket.on("join-game", (gameId: string) => {
        if (!roomPlayers[gameId]) roomPlayers[gameId] = [];

        const players = roomPlayers[gameId];

        // If already in, prevent duplicate
        if (!players.includes(socket.id)) {
          if (players.length < 2) {
            players.push(socket.id);
            socket.join(gameId);

            const assignedColor = players.length === 1 ? "w" : "b";
            socket.emit("assign-color", assignedColor);
            console.log(`Assigned ${assignedColor} to ${socket.id}`);
          } else {
            // Game full
            socket.emit("assign-color", "spectator");
            console.log(`Spectator joined: ${socket.id}`);
          }
        }

        console.log("Joined room:", gameId);
      });

      socket.on("move", ({ gameId, move }) => {
        socket.to(gameId).emit("opponent-move", move);
      });

      socket.on("disconnect", () => {
        for (const [roomId, players] of Object.entries(roomPlayers)) {
          roomPlayers[roomId] = players.filter((id) => id !== socket.id);
        }
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }
}
