import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

function isValidPassword(password: string): boolean {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/.test(
    password,
  );
}

export async function POST(req: Request) {
  try {
    if (req.headers.get("content-type") !== "application/json") {
      return new Response("Content-Type must be application/json", {
        status: 415,
      });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response("Invalid JSON body", { status: 400 });
    }

    const { email, username, password } = body || {};

    if (!email || !username || !password) {
      return new Response(
        "Missing fields: email, username, and password are required",
        {
          status: 400,
        },
      );
    }

    if (!isValidEmail(email)) {
      return new Response("Invalid email format", { status: 400 });
    }

    if (!isValidUsername(username)) {
      return new Response(
        "Invalid username: 3-20 chars, alphanumeric or underscores only",
        {
          status: 400,
        },
      );
    }

    if (!isValidPassword(password)) {
      return new Response(
        "Invalid password: minimum 8 characters, at least one letter and one number",
        { status: 400 },
      );
    }

    const userExists = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (userExists) {
      if (userExists.email === email) {
        return new Response("Email already in use", { status: 409 });
      }
      if (userExists.username === username) {
        return new Response("Username already in use", { status: 409 });
      }
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
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: unknown) {
    console.error("Signup API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
