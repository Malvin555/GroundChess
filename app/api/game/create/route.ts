import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getServerSession(authOptions);

  // Use email as unique identifier since session.user.id does not exist
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find the user by email to get their id
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Create a new game where current user is white
  const game = await prisma.game.create({
    data: {
      playerWhiteId: user.id,
      playerBlackId: user.id, // can update later with real opponent
      moves: [],
    },
  });

  const existingGame = await prisma.game.findFirst({
    where: {
      type: "multiplayer",
      result: null,
      OR: [{ playerWhiteId: dbUser.id }, { playerBlackId: dbUser.id }],
    },
  });

  if (existingGame) {
    return NextResponse.json(
      { gameId: existingGame.id, userId: dbUser.id },
      { status: 200 },
    );
  }

  return NextResponse.json({ gameId: game.id }, { status: 201 });
}
