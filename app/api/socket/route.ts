import { NextResponse } from "next/server";

// Fallback handler for Socket.IO polling requests
// The actual Socket.IO server runs on the custom server (server.js)
// This prevents 404 errors when Socket.IO tries to upgrade connections

export async function GET(request: Request) {
  // Check if this is a Socket.IO request
  const url = new URL(request.url);
  const isSocketIORequest =
    url.searchParams.has("EIO") || url.searchParams.has("transport");

  if (isSocketIORequest) {
    // Return a simple response to prevent 404 errors
    return new NextResponse("Socket.IO handled by custom server", {
      status: 200,
    });
  }

  return NextResponse.json({
    message: "Socket.IO server is running on the custom server",
    endpoint: "ws://localhost:3000/socket.io/",
  });
}

export async function POST() {
  return new NextResponse("Socket.IO handled by custom server", {
    status: 200,
  });
}
