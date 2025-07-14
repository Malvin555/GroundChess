import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";
import { difficultyToLevel } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET() {
  const user = await getUserFromCookie();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const games = await prisma.game.findMany({
    where: {
      OR: [{ playerWhiteId: user.userId }, { playerBlackId: user.userId }],
    },
    orderBy: { createdAt: "desc" },
    select: {
      playerWhiteId: true,
      playerBlackId: true,
      result: true,
      ratingChange: true,
      createdAt: true,
      type: true,
      duration: true,
      difficulty: true, // ✅ Include this
    },
  });

  const totalGames = games.length;
  const wins = games.filter(
    (g) =>
      (g.playerWhiteId === user.userId && g.result === "white") ||
      (g.playerBlackId === user.userId && g.result === "black"),
  ).length;

  const totalDuration = games.reduce((sum, g) => sum + (g.duration ?? 0), 0);
  const averageTime = totalGames ? Math.round(totalDuration / totalGames) : 0;

  const recentGames = games.slice(0, 5).map((game) => {
    const isWhite = game.playerWhiteId === user.userId;
    const won =
      (isWhite && game.result === "white") ||
      (!isWhite && game.result === "black");

    const result = game.result === "draw" ? "Draw" : won ? "Won" : "Lost";
    const rating =
      typeof game.ratingChange === "number"
        ? game.ratingChange >= 0
          ? `+${game.ratingChange}`
          : `${game.ratingChange}`
        : "0";

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
    stats: {
      totalGames,
      winRate: totalGames ? Math.round((wins / totalGames) * 100) : 0,
      averageTime,
    },
    recentGames,
  });
}
