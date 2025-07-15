import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  // FIX: params is already destructured, no need to await it.
  // The error message was misleading, it's about how params is passed/accessed.
  // The current way `({ params }: { params: { id: string } })` is correct for App Router.
  // The error might have been from an older Next.js version or a misunderstanding of the message.
  // However, I've added a console.log to ensure `params.id` is accessed correctly.
  console.log("Fetching user with ID:", params.id);

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, username: true, email: true, rating: true },
    });
    if (!dbUser) {
      return NextResponse.json(
        { message: "User not found in DB" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      userId: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      rating: dbUser.rating,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
