import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // ✅ import cookies()

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return new Response("User not found", { status: 404 });

    const valid = await compare(password, user.password);
    if (!valid) return new Response("Invalid credentials", { status: 401 });

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        rating: user.rating,
        email: user.email, // ✅ include email (your `/api/game/create` uses this)
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    // ✅ Set cookie using Next.js API (works reliably)
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({ username: user.username });
  } catch (err) {
    console.error("Login error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
