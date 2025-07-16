import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

type GameResult = "white" | "black" | "draw";
type PlayerColor = "white" | "black";
type Difficulty = "easy" | "medium" | "hard";

interface GameRequestBody {
  result: GameResult;
  type: string;
  duration: number;
  moves: { from: string; to: string; promotion?: string }[];
  playerColor: PlayerColor;
  difficulty: Difficulty;
}

const RATING_CHANGE: Record<Difficulty, number> = {
  easy: 50,
  medium: 100,
  hard: 150,
};

export async function POST(req: Request) {
  const user = await getUserFromCookie();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { result, type, duration, moves, playerColor, difficulty } =
    (await req.json()) as GameRequestBody;

  const base = RATING_CHANGE[difficulty] ?? 100;
  let ratingChange = 0;

  if (result === playerColor) {
    ratingChange = base;
  } else if (result === "draw") {
    ratingChange = 0;
  } else {
    ratingChange = -Math.floor(base / 2);
  }

  try {
    const game = await prisma.game.create({
      data: {
        playerWhite: {
          connect: { id: playerColor === "white" ? user.userId : "BOT" },
        },
        playerBlack: {
          connect: { id: playerColor === "black" ? user.userId : "BOT" },
        },
        winnerId:
          result === "white"
            ? playerColor === "white"
              ? user.userId
              : "BOT"
            : result === "black"
              ? playerColor === "black"
                ? user.userId
                : "BOT"
              : null,
        loserId:
          result === "white"
            ? playerColor === "black"
              ? user.userId
              : "BOT"
            : result === "black"
              ? playerColor === "white"
                ? user.userId
                : "BOT"
              : null,
        draw: result === "draw",
        status: "finished",
        moves,
        type,
        duration,
        ratingChange,
        difficulty, // Ensure difficulty is saved
        gameId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, // Generate a unique gameId
        endTime: new Date(), // Set the end time to the current date and time
      },
    });

    await prisma.user.update({
      where: { id: user.userId },
      data: {
        rating: { increment: ratingChange },
      },
    });

    return NextResponse.json({ success: true, ratingChange, gameId: game.id });
  } catch (error) {
    console.error("Failed to save game:", error);
    return new NextResponse("Failed", { status: 500 });
  }
}
