import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { result, type, duration, moves, playerColor, difficulty } =
    (await req.json()) as GameRequestBody;

  const base = RATING_CHANGE[difficulty] ?? 100;
  let ratingChange = 0;

  if (result === playerColor) ratingChange = base;
  else if (result === "draw") ratingChange = 0;
  else ratingChange = -Math.floor(base / 2);

  try {
    const game = await prisma.game.create({
      data: {
        playerWhiteId: playerColor === "white" ? user.userId : "BOT",
        playerBlackId: playerColor === "black" ? user.userId : "BOT",
        result,
        ratingChange,
        moves,
        type,
        duration,
        difficulty,
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
// /app/api/game/save/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { gameId, move, result } = await req.json();

  try {
    if (result) {
      await prisma.game.update({
        where: { id: gameId },
        data: { result },
      });
    } else if (move) {
      await prisma.game.update({
        where: { id: gameId },
        data: {
          moves: { push: move },
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Error saving game:", e);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
