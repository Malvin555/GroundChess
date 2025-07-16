import DashboardClient from "@/components/pages/dashboard/dashboard";
import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await getUserFromCookie();

  if (!user) return <div className="p-8">Unauthorized</div>; // 👈 Early return

  // 🔄 Always get fresh rating from DB
  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: {
      id: true,
      username: true,
      rating: true,
    },
  });

  const userData = dbUser ?? undefined;

  const games = await prisma.game.findMany({
    where: {
      OR: [{ playerWhiteId: user.userId }, { playerBlackId: user.userId }],
    },
    orderBy: { createdAt: "desc" },
  });

  const totalGames = games.length;

  const wins = games.filter(
    (g) =>
      (g.playerWhiteId === user.userId && g.winnerId === g.playerWhiteId) ||
      (g.playerBlackId === user.userId && g.winnerId === g.playerBlackId),
  ).length;

  const totalDuration = games.reduce((sum, g) => sum + (g.duration ?? 0), 0);
  const averageTime = totalGames ? Math.round(totalDuration / totalGames) : 0;

  const initialGames = games.slice(0, 5).map((game) => {
    const isWhite = game.playerWhiteId === user.userId;
    const won =
      (isWhite && game.winnerId === game.playerWhiteId) ||
      (!isWhite && game.winnerId === game.playerBlackId);

    const result = game.draw ? "Draw" : won ? "Won" : "Lost";

    const rating = (game.ratingChange ?? 0).toString();
    const opponent =
      game.type === "vsAI" ? `AI (${game.difficulty})` : "Player";

    return {
      opponent,
      result,
      rating,
      time: game.createdAt.toISOString(),
    };
  });

  return (
    <DashboardClient
      stats={{
        totalGames,
        winRate: totalGames ? Math.round((wins / totalGames) * 100) : 0,
        averageTime,
      }}
      user={userData}
      initialGames={initialGames}
    />
  );
}
