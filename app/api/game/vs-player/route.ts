"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VsPlayerPage() {
  const router = useRouter();

  useEffect(() => {
    const createGame = async () => {
      const res = await fetch("/api/game/create", {
        method: "POST",
      });

      if (res.ok) {
        const { gameId } = await res.json();
        router.push(`/game/vs-player/${gameId}`);
      } else {
        alert("You must be logged in to start a game.");
        router.push("/auth/login");
      }
    };

    createGame();
  }, [router]);

  return null;
}
