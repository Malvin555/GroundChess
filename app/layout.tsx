import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { getUserFromCookie } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import { prisma } from "@/lib/prisma"; // ✅ needed

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GroundChess - Master Chess Online | Enhance Your Skills",
  description:
    "Challenge AI opponents, play with friends, and improve your chess skills with our advanced training platform. Join a community of chess enthusiasts and elevate your game to the next level.",
  keywords:
    "chess, online chess, chess training, chess platform, chess community, chess improvement, chess AI, chess friends",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userFromCookie = await getUserFromCookie();
  const isLoggedIn = !!userFromCookie;

  // ✅ fetch latest rating from DB if logged in
  const dbUser = userFromCookie
    ? await prisma.user.findUnique({
        where: { id: userFromCookie.userId },
        select: {
          id: true,
          username: true,
          rating: true,
        },
      })
    : null;

  return (
    <html lang="en" className="bg-background text-foreground">
      <body className={`${inter.className} bg-background text-foreground`}>
        <div className="min-h-screen bg-background">
          <Navbar isLoggedIn={isLoggedIn} user={dbUser ?? undefined} />
          <main className="relative overflow-hidden">
            <div className="relative container mx-auto px-4 space-y-24 py-8">
              {children}
              <Footer />
            </div>
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
