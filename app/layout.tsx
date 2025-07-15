import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/navbar";
import { getUserFromCookie } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChessHub - Master Chess Online",
  description:
    "Challenge AI opponents, play with friends, and improve your chess skills with our advanced training platform",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userData = await getUserFromCookie();
  const isLoggedIn = !!userData;

  const user = userData
    ? {
        id: userData.userId,
        username: userData.username,
        rating: userData.rating,
      }
    : undefined;

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <Navbar isLoggedIn={isLoggedIn} user={user} />
          <main className="relative overflow-hidden">
            <div className="relative container mx-auto px-4 space-y-24 py-8">
              {children}
            </div>
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
