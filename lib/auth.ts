// lib/auth.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getUserFromCookie() {
  const cookieStore = await cookies(); // ✅ await is now required in Next.js 14+

  const token = cookieStore.get("token")?.value;

  if (!token) {
    console.warn("[auth] No token found in cookies.");
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      username: string;
      rating: number;
      email: string;
    };
    return payload;
  } catch (error) {
    console.error("[auth] JWT verification failed:", error);
    return null;
  }
}
