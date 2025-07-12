import type { NextApiRequest } from "next";
import type { NextApiResponseWithSocket } from "@/lib/socket";
import initSocket from "@/lib/socket";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket,
) {
  if (!res.socket.server.io) {
    initSocket(res);
  }
  res.end();
}
