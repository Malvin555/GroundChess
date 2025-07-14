import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const offset = parseInt(searchParams.get("offset") || "0");

  const games = await prisma.game.findMany({
    where: {
      OR: [{ playerWhiteId: user.userId }, { playerBlackId: user.userId }],
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: offset,
    take: 5,
    select: {
      playerWhiteId: true,
      playerBlackId: true,
      result: true,
      ratingChange: true,
      createdAt: true,
      type: true,
      difficulty: true,
    },
  });

  const formattedGames = games.map((game) => {
    const isWhite = game.playerWhiteId === user.userId;
    const playerWon =
      (isWhite && game.result === "white") ||
      (!isWhite && game.result === "black");

    const result = game.result === "draw" ? "Draw" : playerWon ? "Won" : "Lost";

    const ratingChange = game.ratingChange ?? 0;
    const rating = ratingChange >= 0 ? `+${ratingChange}` : `${ratingChange}`;

    const opponent =
      game.type === "vsAI"
        ? `AI Level ${difficultyToLevel(game.difficulty)}`
        : "Player";

    return {
      opponent,
      result,
      rating,
      time: game.createdAt,
    };
  });

  return NextResponse.json({
    games: formattedGames,
    hasMore: games.length === 5, // if 5 returned, assume more exist
  });
}

function difficultyToLevel(difficulty: string | null | undefined): string {
  switch (difficulty) {
    case "easy":
      return "1";
    case "medium":
      return "2";
    case "hard":
      return "3";
    default:
      return "?";
  }
}
