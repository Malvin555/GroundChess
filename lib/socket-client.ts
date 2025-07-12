import { io } from "socket.io-client";

let socket: ReturnType<typeof io> | null = null;

export function getSocket() {
  if (!socket) {
    socket = io({
      path: "/api/socket",
    });
  }
  return socket;
}
