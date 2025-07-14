export const runtime = "nodejs";

export async function POST() {
  const response = new Response("Logged out", { status: 200 });

  response.headers.set(
    "Set-Cookie",
    `token=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict; ${
      process.env.NODE_ENV === "production" ? "Secure;" : ""
    }`,
  );

  return response;
}
