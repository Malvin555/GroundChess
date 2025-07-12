"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Chess, Square, Move } from "chess.js";
import { Button } from "@/components/ui/button";
import { Chessboard } from "react-chessboard";

// Minimax algorithm with depth limit for harder AI
function evaluateBoard(game: Chess): number {
  // Simple evaluation: material count
  const pieceValues: Record<string, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0,
  };
  const fen = game.fen();
  const [position] = fen.split(" ");
  let evalScore = 0;
  for (const char of position) {
    if (char === "/") continue;
    if (char >= "1" && char <= "8") continue;
    const isWhite = char === char.toUpperCase();
    const value = pieceValues[char.toLowerCase()] || 0;
    evalScore += isWhite ? value : -value;
  }
  return evalScore;
}

function minimax(
  game: Chess,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
): { score: number; move?: Move } {
  if (depth === 0 || game.isGameOver()) {
    return { score: evaluateBoard(game) };
  }

  const moves = game.moves({ verbose: true });
  let bestMove: Move | undefined = undefined;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const gameCopy = new Chess(game.fen());
      gameCopy.move(move);
      const evalResult = minimax(gameCopy, depth - 1, false, alpha, beta);
      if (evalResult.score > maxEval) {
        maxEval = evalResult.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, evalResult.score);
      if (beta <= alpha) break;
    }
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const gameCopy = new Chess(game.fen());
      gameCopy.move(move);
      const evalResult = minimax(gameCopy, depth - 1, true, alpha, beta);
      if (evalResult.score < minEval) {
        minEval = evalResult.score;
        bestMove = move;
      }
      beta = Math.min(beta, evalResult.score);
      if (beta <= alpha) break;
    }
    return { score: minEval, move: bestMove };
  }
}

function getBestMove(game: Chess, depth: number) {
  // Only search for black's move
  if (game.turn() !== "b") return null;
  const result = minimax(game, depth, false, -Infinity, Infinity);
  return result.move || null;
}

function getGameResult(game: Chess) {
  if (!game.isGameOver()) return null;
  if (game.isCheckmate()) {
    return game.turn() === "w"
      ? "Black wins by checkmate"
      : "White wins by checkmate";
  }
  if (game.isDraw()) {
    if (game.isStalemate()) return "Draw by stalemate";
    if (game.isThreefoldRepetition()) return "Draw by threefold repetition";
    if (game.isInsufficientMaterial()) return "Draw by insufficient material";
    return "Draw";
  }
  return "Game over";
}

export default function VsBotPage() {
  const [game, setGame] = useState(() => new Chess());
  const [status, setStatus] = useState<string | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  // Update status message on game change
  useEffect(() => {
    setStatus(getGameResult(game));
  }, [game]);

  // Bot move logic (now uses minimax for harder AI)
  const makeBotMove = useCallback(() => {
    setIsBotThinking(true);
    setTimeout(() => {
      setGame((current) => {
        const gameCopy = new Chess(current.fen());
        if (gameCopy.isGameOver() || gameCopy.turn() !== "b") {
          setIsBotThinking(false);
          return current;
        }
        // Increase depth for more difficulty (e.g., 2 or 3)
        const move = getBestMove(gameCopy, 2);
        if (move) {
          gameCopy.move(move);
        }
        setIsBotThinking(false);
        return gameCopy;
      });
    }, 400);
  }, []);

  // Handle piece drop
  const onDrop = (source: Square, target: Square): boolean => {
    if (game.isGameOver() || isBotThinking) return false;

    const gameCopy = new Chess(game.fen());
    const move = gameCopy.move({
      from: source,
      to: target,
      promotion: "q",
    });

    if (move === null) {
      // Optionally, you could show a toast or error here
      return false; // snapback
    }

    setGame(gameCopy);

    // Bot moves after player's move, if game not over
    if (!gameCopy.isGameOver()) {
      makeBotMove();
    }

    return true;
  };

  // Restart game
  const handleRestart = () => {
    setGame(new Chess());
    setStatus(null);
    setIsBotThinking(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Play vs AI</h1>

      <div ref={boardRef}>
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardWidth={400}
          arePiecesDraggable={!game.isGameOver() && !isBotThinking}
          boardOrientation="white"
          customBoardStyle={{
            borderRadius: "8px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
          }}
          animationDuration={200}
        />
      </div>

      <div className="mt-4 min-h-[32px] flex flex-col items-center">
        {status && <p className="text-red-600 font-semibold">{status}</p>}
        {!status && (
          <p className="text-gray-700">
            {isBotThinking
              ? "AI is thinking..."
              : game.turn() === "w"
                ? "Your move"
                : "AI's move"}
          </p>
        )}
      </div>

      <Button
        className="mt-4"
        onClick={handleRestart}
        disabled={isBotThinking}
        variant="outline"
      >
        Restart Game
      </Button>
    </div>
  );
}
