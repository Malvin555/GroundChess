// pages/api/socket.ts
import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

const rooms: Record<string, string[]> = {};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket,
) {
  if (!res.socket.server.io) {
    console.log("🟢 Initializing Socket.IO server...");

    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("🧑 Connected:", socket.id);

      socket.on("join-game", (roomId: string) => {
        if (!rooms[roomId]) rooms[roomId] = [];

        const playerCount = rooms[roomId].length;
        let assignedColor: "w" | "b" | "spectator" = "spectator";

        if (!rooms[roomId].includes(socket.id)) {
          if (playerCount < 2) {
            assignedColor = playerCount === 0 ? "w" : "b";
            rooms[roomId].push(socket.id);
            socket.join(roomId);
          }
        }

        console.log(`Player joined ${roomId} as ${assignedColor}`);
        socket.emit("assign-color", assignedColor);
      });

      socket.on("move", ({ gameId, move }) => {
        socket.to(gameId).emit("opponent-move", move);
      });

      socket.on("disconnect", () => {
        for (const roomId in rooms) {
          rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
        }
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  res.end();
}
