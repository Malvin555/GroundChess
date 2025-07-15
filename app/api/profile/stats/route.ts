import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

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
      winnerId: true,
      draw: true,
      createdAt: true,
      duration: true,
    },
  });

  const totalGames = games.length;
  const wins = games.filter(
    (g) =>
      (g.playerWhiteId === user.userId && g.winnerId === g.playerWhiteId) ||
      (g.playerBlackId === user.userId && g.winnerId === g.playerBlackId),
  ).length;

  const totalDuration = games.reduce((sum, g) => sum + (g.duration ?? 0), 0);
  const averageTime = totalGames ? Math.round(totalDuration / totalGames) : 0;

  const recentGames = games.slice(0, 5).map((game) => {
    const isWhite = game.playerWhiteId === user.userId;
    const won =
      (isWhite && game.winnerId === game.playerWhiteId) ||
      (!isWhite && game.winnerId === game.playerBlackId);

    const result = game.draw ? "Draw" : won ? "Won" : "Lost";
    const rating = "0"; // Placeholder since ratingChange does not exist

    const opponent = "Player"; // Assuming all games are against players

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
