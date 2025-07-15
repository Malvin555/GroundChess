import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";
import { Chess } from "chess.js";

export async function POST(
  req: Request,
  { params }: { params: { gameId: string } },
) {
  const user = await getUserFromCookie();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  // Fix: Await params before destructuring
  const { gameId } = await params;
  const userId = user.userId;

  console.log("User ID from cookie:", userId); // <--- ADD THIS LINE

  // ✅ Check if user exists to prevent foreign key violation
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!existingUser) {
    return new NextResponse("User not found", { status: 404 });
  }

  console.log(`Attempting to join game with userId: ${userId}`);

  try {
    let game = await prisma.game.findUnique({
      where: { gameId: gameId }, // Corrected: Explicitly specify gameId
      include: { playerWhite: true, playerBlack: true },
    });

    if (!game) {
      // Game does not exist, create it and assign current user as white
      game = await prisma.game.create({
        data: {
          gameId,
          playerWhiteId: userId,
          status: "waiting",
          fen: new Chess().fen(), // Initial FEN
          currentTurn: "white",
          moves: [],
        },
        include: { playerWhite: true, playerBlack: true },
      });
      console.log(`Game ${gameId} created by ${user.username} as white.`);
      return NextResponse.json({
        game,
        yourColor: "white",
        message: "Game created. Waiting for opponent...",
      });
    }

    // Game exists
    if (game.playerWhiteId === userId || game.playerBlackId === userId) {
      const yourColor = game.playerWhiteId === userId ? "white" : "black";
      console.log(
        `User ${user.username} re-joined game ${gameId} as ${yourColor}.`,
      );
      return NextResponse.json({
        game,
        yourColor,
        message:
          game.status === "playing"
            ? "Game in progress."
            : "Waiting for opponent...",
      });
    }

    if (!game.playerWhiteId) {
      game = await prisma.game.update({
        where: { gameId: gameId }, // Corrected: Explicitly specify gameId
        data: { playerWhiteId: userId },
        include: { playerWhite: true, playerBlack: true },
      });
      console.log(`User ${user.username} joined game ${gameId} as white.`);
      return NextResponse.json({
        game,
        yourColor: "white",
        message: "Joined game. Waiting for opponent...",
      });
    } else if (!game.playerBlackId) {
      game = await prisma.game.update({
        where: { gameId: gameId }, // Corrected: Explicitly specify gameId
        data: {
          playerBlackId: userId,
          status: "playing",
          startTime: new Date(),
        },
        include: { playerWhite: true, playerBlack: true },
      });
      console.log(
        `User ${user.username} joined game ${gameId} as black. Game started!`,
      );
      return NextResponse.json({
        game,
        yourColor: "black",
        message: "Joined game. Game started!",
      });
    } else {
      console.log(`Game ${gameId} is full. User ${user.username} cannot join.`);
      return new NextResponse("Game is full.", { status: 409 });
    }
  } catch (error) {
    console.error("Failed to join/create game:", error);
    return new NextResponse("Failed to join/create game", { status: 500 });
  }
}
