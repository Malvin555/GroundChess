import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getUserFromCookie();

  if (!user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { id: true, username: true, email: true, rating: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { message: "User not found in DB" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      user: {
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
        rating: dbUser.rating,
      },
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
