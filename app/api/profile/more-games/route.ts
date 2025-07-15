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
      winnerId: true,
      loserId: true,
      draw: true,
      createdAt: true,
    },
  });

  const formattedGames = games.map((game) => {
    const isWhite = game.playerWhiteId === user.userId;
    const playerWon =
      (isWhite && game.winnerId === game.playerWhiteId) ||
      (!isWhite && game.winnerId === game.playerBlackId);

    const result = game.draw ? "Draw" : playerWon ? "Won" : "Lost";

    const ratingChange = 0; // Placeholder for ratingChange since it doesn't exist in the type
    const rating = ratingChange >= 0 ? `+${ratingChange}` : `${ratingChange}`;

    const opponent = "Player"; // Placeholder for opponent since type and difficulty don't exist in the type

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
