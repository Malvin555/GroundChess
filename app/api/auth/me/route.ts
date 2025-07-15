import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";

export async function GET() {
  const user = await getUserFromCookie();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  return NextResponse.json({
    userId: user.userId,
    username: user.username,
    rating: user.rating,
    email: user.email,
  });
}
