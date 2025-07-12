import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return new Response("User not found", { status: 404 });

    const valid = await compare(password, user.password);
    if (!valid) return new Response("Invalid credentials", { status: 401 });

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    const response = new Response(JSON.stringify({ username: user.username }), {
      status: 200,
    });

    response.headers.set(
      "Set-Cookie",
      `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`,
    );

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
