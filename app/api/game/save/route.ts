import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getUserFromCookie();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const {
    result, // "white", "black", "draw"
    type, // "vsAI"
    duration,
    moves,
    playerColor, // "white" or "black"
    difficulty, // "easy", "medium", "hard"
  } = body;

  // 1. Define rating values per difficulty
  const DIFFICULTY_RATING = {
    easy: 100,
    medium: 300,
    hard: 700,
  };
  const value = DIFFICULTY_RATING[difficulty] ?? 300;

  // 2. Determine rating change
  let ratingChange = 0;
  if (result === playerColor) {
    ratingChange = value;
  } else if (result === "draw") {
    ratingChange = 0;
  } else {
    ratingChange = -value;
  }

  try {
    // 3. Save the game
    const game = await prisma.game.create({
      data: {
        playerWhiteId: playerColor === "white" ? user.userId : "BOT",
        playerBlackId: playerColor === "black" ? user.userId : "BOT",
        result,
        ratingChange,
        moves,
        type,
        duration,
      },
    });

    // 4. Update user's rating
    await prisma.user.update({
      where: { id: user.userId },
      data: {
        rating: {
          increment: ratingChange,
        },
      },
    });

    return NextResponse.json({ success: true, gameId: game.id });
  } catch (err) {
    console.error("Error saving game:", err);
    return new NextResponse("Failed to save game", { status: 500 });
  }
}
