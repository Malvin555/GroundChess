import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return new Response("User not found", { status: 404 });

    const valid = await compare(password, user.password);
    if (!valid) return new Response("Invalid credentials", { status: 401 });

    // ✅ Include username & rating in token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        rating: user.rating,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    const response = NextResponse.json({ username: user.username });

    response.headers.set(
      "Set-Cookie",
      `token=${token}; Path=/; HttpOnly; Max-Age=604800; SameSite=Strict; ${
        process.env.NODE_ENV === "production" ? "Secure;" : ""
      }`,
    );

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
