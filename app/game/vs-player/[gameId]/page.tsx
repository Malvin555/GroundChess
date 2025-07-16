"use client";
import dynamic from "next/dynamic";

// ✅ Import dynamically to avoid Server Component hydration mismatch
const VsPlayerGame = dynamic(
  () => import("@/components/pages/games/vs-player"),
  {
    ssr: false,
  },
);

export default function VsPlayerGamePageWrapper() {
  return <VsPlayerGame />;
}
