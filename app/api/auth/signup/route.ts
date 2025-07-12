import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, username, password } = body;

    if (!email || !username || !password) {
      return new Response("Missing fields", { status: 400 });
    }

    const userExists = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (userExists) {
      return new Response("User already exists", { status: 409 });
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    return new Response(
      JSON.stringify({ id: user.id, username: user.username }),
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Signup API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
