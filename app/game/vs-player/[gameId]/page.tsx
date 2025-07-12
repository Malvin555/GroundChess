"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { getSocket } from "@/lib/socket-client";

export default function VsPlayerGamePage() {
  const { gameId } = useParams() as { gameId: string };
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const [game, setGame] = useState(() => new Chess());
  const [playerColor, setPlayerColor] = useState<"w" | "b" | "spectator">(
    "spectator",
  );

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    socket.emit("join-game", gameId);
    console.log("Joined room:", gameId);

    socket.on("assign-color", (color) => {
      console.log("Assigned color:", color);
      setPlayerColor(color);
    });

    socket.on("opponent-move", (move) => {
      setGame((prev) => {
        const updated = new Chess(prev.fen());
        updated.move(move);
        return updated;
      });
    });

    return () => {
      socket.off("assign-color");
      socket.off("opponent-move");
    };
  }, [gameId]);

  const onDrop = (source: Square, target: Square): boolean => {
    if (game.isGameOver() || game.turn() !== playerColor) return false;

    const gameCopy = new Chess(game.fen());
    const move = gameCopy.move({
      from: source,
      to: target,
      promotion: "q",
    });

    if (!move) return false;

    setGame(gameCopy);

    socketRef.current?.emit("move", { gameId, move });

    return true;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Multiplayer Chess</h1>

      <Chessboard
        position={game.fen()}
        onPieceDrop={onDrop}
        boardOrientation={playerColor === "w" ? "white" : "black"}
        boardWidth={400}
        arePiecesDraggable={
          playerColor !== "spectator" &&
          game.turn() === playerColor &&
          !game.isGameOver()
        }
      />

      {game.isGameOver() && (
        <p className="mt-4 text-red-600 font-semibold">Game Over</p>
      )}
    </div>
  );
}
