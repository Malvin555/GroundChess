"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Chess, Square, Move } from "chess.js";
import { Button } from "@/components/ui/button";
import { Chessboard } from "react-chessboard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

function evaluateBoard(game: Chess): number {
  const [position] = game.fen().split(" ");
  let score = 0;
  for (const char of position) {
    if (char === "/" || !isNaN(Number(char))) continue;
    const isWhite = char === char.toUpperCase();
    score += (isWhite ? 1 : -1) * (PIECE_VALUES[char.toLowerCase()] || 0);
  }
  return score;
}

function minimax(
  game: Chess,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
): { score: number; move?: Move } {
  if (depth === 0 || game.isGameOver()) return { score: evaluateBoard(game) };
  const moves = game.moves({ verbose: true });
  let bestMove: Move | undefined;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const clone = new Chess(game.fen());
      clone.move(move);
      const { score } = minimax(clone, depth - 1, false, alpha, beta);
      if (score > maxEval) {
        maxEval = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const clone = new Chess(game.fen());
      clone.move(move);
      const { score } = minimax(clone, depth - 1, true, alpha, beta);
      if (score < minEval) {
        minEval = score;
        bestMove = move;
      }
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return { score: minEval, move: bestMove };
  }
}

function getBestMove(game: Chess, depth: number) {
  if (game.turn() !== "b") return null;
  const { move } = minimax(game, depth, false, -Infinity, Infinity);
  return move || null;
}

function getGameResult(game: Chess): string | null {
  if (!game.isGameOver()) return null;
  if (game.isCheckmate())
    return game.turn() === "w"
      ? "Black wins by checkmate"
      : "White wins by checkmate";
  if (game.isStalemate()) return "Draw by stalemate";
  if (game.isThreefoldRepetition()) return "Draw by repetition";
  if (game.isInsufficientMaterial()) return "Draw by insufficient material";
  return "Draw";
}

const difficultyRatingMap = {
  easy: 100,
  medium: 300,
  hard: 700,
};

export default function VsBotPage() {
  const [game, setGame] = useState(() => new Chess());
  const [status, setStatus] = useState<string | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showResult, setShowResult] = useState(false);
  const [ratingChange, setRatingChange] = useState(0);

  const boardRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number | null>(null);

  const searchParams = useSearchParams();
  const level = searchParams.get("level") ?? "medium";
  const depth = level === "easy" ? 1 : level === "hard" ? 3 : 2;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showCountdown && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (countdown === 0) {
      setGameStarted(true);
      setShowCountdown(false);
      startTimeRef.current = Date.now();
    }
    return () => clearTimeout(timer);
  }, [showCountdown, countdown]);

  useEffect(() => {
    const result = getGameResult(game);
    if (result) {
      const duration = Math.floor(
        (Date.now() - (startTimeRef.current ?? Date.now())) / 1000,
      );
      setStatus(result);
      setShowResult(true);

      const playerWon = result.includes("White wins");
      const base = difficultyRatingMap[level];
      setRatingChange(playerWon ? base : -base);

      fetch("/api/game/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          result: playerWon ? "white" : "black",
          type: "vsAI",
          duration,
          moves: game.history({ verbose: true }),
          playerColor: "white",
          difficulty: level,
        }),
      });
    }
  }, [game, level]);

  const makeBotMove = useCallback(() => {
    setIsBotThinking(true);
    setTimeout(() => {
      setGame((prev) => {
        const clone = new Chess(prev.fen());
        if (clone.isGameOver() || clone.turn() !== "b") {
          setIsBotThinking(false);
          return prev;
        }
        const move = getBestMove(clone, depth);
        if (move) clone.move(move);
        setIsBotThinking(false);
        return clone;
      });
    }, 300);
  }, [depth]);

  const onDrop = (source: Square, target: Square): boolean => {
    if (!gameStarted || game.isGameOver() || isBotThinking) return false;
    const clone = new Chess(game.fen());
    const move = clone.move({ from: source, to: target, promotion: "q" });
    if (!move) return false;
    setGame(clone);
    if (!clone.isGameOver()) makeBotMove();
    return true;
  };

  const handleStart = () => {
    setShowCountdown(true);
    setCountdown(3);
  };

  const handleRestart = () => {
    setGame(new Chess());
    setStatus(null);
    setIsBotThinking(false);
    setGameStarted(false);
    setShowResult(false);
    setShowCountdown(false);
    startTimeRef.current = null;
  };

  const handleGiveUp = async () => {
    const duration = Math.floor(
      (Date.now() - (startTimeRef.current ?? Date.now())) / 1000,
    );
    await fetch("/api/game/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        result: "black",
        type: "vsAI",
        duration,
        moves: game.history({ verbose: true }),
        playerColor: "white",
        difficulty: level,
      }),
    });
    setStatus("You gave up. AI wins.");
    setShowResult(true);
    setRatingChange(-difficultyRatingMap[level]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Play vs AI ({level})</h1>

      {showCountdown && (
        <p className="text-2xl font-semibold mb-4">
          Starting in {countdown}...
        </p>
      )}

      {!gameStarted && !showCountdown && (
        <Button className="mb-4" onClick={handleStart}>
          Start Game
        </Button>
      )}

      <div ref={boardRef} className="mb-4">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardWidth={400}
          arePiecesDraggable={
            gameStarted && !game.isGameOver() && !isBotThinking
          }
          boardOrientation="white"
          customBoardStyle={{
            borderRadius: "8px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
          }}
          animationDuration={200}
        />
      </div>

      <div className="min-h-[32px] text-center">
        {status ? (
          <p className="text-red-600 font-semibold">{status}</p>
        ) : gameStarted ? (
          <p className="text-gray-700">
            {isBotThinking ? "AI is thinking..." : "Your move"}
          </p>
        ) : null}
      </div>

      <Button
        className="mt-4"
        onClick={handleRestart}
        disabled={isBotThinking}
        variant="outline"
      >
        Restart Game
      </Button>
      <Button
        className="mt-2"
        onClick={handleGiveUp}
        disabled={isBotThinking || game.isGameOver()}
        variant="destructive"
      >
        Give Up
      </Button>

      <Dialog open={showResult}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Game Over</DialogTitle>
          </DialogHeader>
          <p className="text-center">{status}</p>
          <p className="text-center mt-2">
            Rating Change: {ratingChange > 0 ? "+" : ""}
            {ratingChange}
          </p>
          <div className="mt-4 flex justify-center">
            <Button onClick={handleRestart}>Play Again</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
