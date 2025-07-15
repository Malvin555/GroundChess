"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Chess, type Square, type Move } from "chess.js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Chessboard } from "react-chessboard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot,
  User,
  Clock,
  Trophy,
  RotateCcw,
  Flag,
  Play,
  Crown,
  Target,
  Zap,
  Brain,
  Timer,
} from "lucide-react";

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

// Enhanced evaluation function
function evaluateBoard(game: Chess): number {
  const [position] = game.fen().split(" ");
  let score = 0;

  // Material evaluation
  for (const char of position) {
    if (char === "/" || !isNaN(Number(char))) continue;
    const isWhite = char === char.toUpperCase();
    const pieceValue = PIECE_VALUES[char.toLowerCase()] || 0;
    score += (isWhite ? 1 : -1) * pieceValue;
  }

  // Add positional bonuses
  const moves = game.moves({ verbose: true });
  score += moves.length * 0.1; // Mobility bonus

  // King safety (simplified)
  if (game.inCheck()) {
    score += game.turn() === "w" ? -0.5 : 0.5;
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
  if (depth === 0 || game.isGameOver()) {
    return { score: evaluateBoard(game) };
  }

  const moves = game.moves({ verbose: true });
  let bestMove: Move | undefined;

  if (isMaximizing) {
    let maxEval = Number.NEGATIVE_INFINITY;
    for (const move of moves) {
      const clone = new Chess(game.fen());
      clone.move(move);
      const { score } = minimax(clone, depth - 1, false, alpha, beta);
      if (score > maxEval) {
        maxEval = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Number.POSITIVE_INFINITY;
    for (const move of moves) {
      const clone = new Chess(game.fen());
      clone.move(move);
      const { score } = minimax(clone, depth - 1, true, alpha, beta);
      if (score < minEval) {
        minEval = score;
        bestMove = move;
      }
      beta = Math.min(beta, score);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return { score: minEval, move: bestMove };
  }
}

function getBestMove(game: Chess, depth: number) {
  if (game.turn() !== "b") return null;
  const { move } = minimax(
    game,
    depth,
    false,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
  );
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

const difficultyConfig = {
  easy: { depth: 1, rating: 1200, color: "bg-blue-500", thinkTime: 800 },
  medium: { depth: 2, rating: 1600, color: "bg-yellow-500", thinkTime: 1200 },
  hard: { depth: 3, rating: 2000, color: "bg-orange-500", thinkTime: 1800 },
};

const difficultyRatingMap = {
  easy: 50,
  medium: 100,
  hard: 150,
};

export default function VsBotPage() {
  const [game, setGame] = useState(() => new Chess());
  const [hasGivenUp, setHasGivenUp] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showResult, setShowResult] = useState(false);
  const [ratingChange, setRatingChange] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");

  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    null,
  );

  const boardRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);

  const searchParams = useSearchParams();
  const level =
    (searchParams && searchParams.get("level")) ?? selectedDifficulty;
  const difficulty =
    difficultyConfig[level as keyof typeof difficultyConfig] ||
    difficultyConfig.medium;

  // Game timer
  useEffect(() => {
    if (gameStarted && !game.isGameOver()) {
      gameTimerRef.current = setInterval(() => {
        setGameTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    }

    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    };
  }, [gameStarted, game]);

  // Countdown timer
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

  // Game over detection
  useEffect(() => {
    const result = getGameResult(game);
    if (result) {
      const duration = Math.floor(
        (Date.now() - (startTimeRef.current ?? Date.now())) / 1000,
      );
      setStatus(result);
      setShowResult(true);
      const playerWon = result.includes("White wins");
      const base =
        difficultyRatingMap[level as keyof typeof difficultyRatingMap] || 100;
      setRatingChange(playerWon ? base : -Math.floor(base / 2));

      // Save game
      fetch("/api/game/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          result: playerWon
            ? "white"
            : result.includes("Draw")
              ? "draw"
              : "black",
          type: "vsAI",
          duration,
          moves: game.history({ verbose: true }),
          playerColor: "white",
          difficulty: level,
        }),
      }).catch(console.error);
    }
  }, [game, level]);

  const makeBotMove = useCallback(() => {
    setIsBotThinking(true);
    setTimeout(
      () => {
        setGame((prev) => {
          const clone = new Chess(prev.fen());
          if (clone.isGameOver() || clone.turn() !== "b") {
            setIsBotThinking(false);
            return prev;
          }
          const move = getBestMove(clone, difficulty.depth);
          if (move) {
            clone.move(move);
            setLastMove({ from: move.from, to: move.to });
          }
          setIsBotThinking(false);
          return clone;
        });
      },
      difficulty.thinkTime + Math.random() * 500,
    ); // Add some randomness to thinking time
  }, [difficulty]);

  const onDrop = (source: Square, target: Square): boolean => {
    if (!gameStarted || game.isGameOver() || isBotThinking) return false;

    const clone = new Chess(game.fen());
    try {
      const move = clone.move({ from: source, to: target, promotion: "q" });
      if (!move) return false;

      setGame(clone);
      setLastMove({ from: source, to: target });

      if (!clone.isGameOver()) {
        setTimeout(() => makeBotMove(), 100);
      }
      return true;
    } catch {
      return false;
    }
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
    setGameTime(0);
    setMoveHistory([]);
    setLastMove(null);
    setHasGivenUp(false); // 🔁 RESET here
    startTimeRef.current = null;
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }
  };

  const handleGiveUp = async () => {
    if (hasGivenUp) return; // prevent second press
    setHasGivenUp(true);

    const duration = Math.floor(
      (Date.now() - (startTimeRef.current ?? Date.now())) / 1000,
    );
    try {
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
    } catch (error) {
      console.error("Failed to save game:", error);
    }

    setStatus("You gave up. AI wins.");
    setShowResult(true);
    setRatingChange(
      -Math.floor(
        difficultyRatingMap[level as keyof typeof difficultyRatingMap] / 2,
      ),
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
              <Bot className="h-8 w-8 text-primary" />
              Chess vs AI
              <Crown className="h-8 w-8 text-yellow-500" />
            </h1>
            <p className="text-muted-foreground">
              Challenge our AI and improve your chess skills
            </p>
          </div>

          {/* Countdown Overlay */}
          {showCountdown && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <Card className="text-center p-8">
                <CardContent className="space-y-4">
                  <div className="text-6xl font-bold text-primary">
                    {countdown}
                  </div>
                  <p className="text-xl">Game starting...</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Game Info */}
            <div className="space-y-6">
              {/* Difficulty Selection */}
              {!gameStarted && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Select Difficulty
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select
                      value={selectedDifficulty}
                      onValueChange={setSelectedDifficulty}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(difficultyConfig).map(
                          ([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${config.color}`}
                                />
                                <span className="capitalize">{key}</span>
                                <span className="text-muted-foreground">
                                  ({config.rating})
                                </span>
                              </div>
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}

              {/* Game Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Game Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Difficulty:
                    </span>
                    <Badge variant="outline" className="capitalize">
                      {level} ({difficulty.rating})
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Time:</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span className="font-mono">{formatTime(gameTime)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Moves:
                    </span>
                    <span className="font-mono">
                      {Math.ceil(moveHistory.length / 2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Players */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Players
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">You (White)</span>
                    </div>
                    {game.turn() === "w" &&
                      gameStarted &&
                      !game.isGameOver() && (
                        <Badge variant="default">Your Turn</Badge>
                      )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <span className="font-medium">AI (Black)</span>
                    </div>
                    {isBotThinking && (
                      <Badge variant="secondary" className="animate-pulse">
                        <Brain className="h-3 w-3 mr-1" />
                        Thinking...
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Center - Chess Board */}
            <div className="flex flex-col items-center space-y-6">
              <Card className="p-4">
                <div ref={boardRef}>
                  <Chessboard
                    position={game.fen()}
                    onPieceDrop={onDrop}
                    boardWidth={Math.min(
                      400,
                      typeof window !== "undefined"
                        ? window.innerWidth - 100
                        : 500,
                    )}
                    arePiecesDraggable={
                      gameStarted && !game.isGameOver() && !isBotThinking
                    }
                    boardOrientation="white"
                    customBoardStyle={{
                      borderRadius: "12px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    }}
                    customSquareStyles={
                      lastMove
                        ? {
                            [lastMove.from]: {
                              backgroundColor: "rgba(255, 255, 0, 0.4)",
                            },
                            [lastMove.to]: {
                              backgroundColor: "rgba(255, 255, 0, 0.4)",
                            },
                          }
                        : {}
                    }
                    animationDuration={300}
                  />
                </div>
              </Card>

              {/* Game Status */}
              <div className="text-center space-y-2">
                {status ? (
                  <p className="text-lg font-semibold text-destructive">
                    {status}
                  </p>
                ) : gameStarted ? (
                  <div className="space-y-2">
                    <p className="text-lg font-medium">
                      {isBotThinking ? (
                        <span className="flex items-center gap-2 justify-center">
                          <Brain className="h-4 w-4 animate-pulse" />
                          AI is thinking...
                        </span>
                      ) : game.turn() === "w" ? (
                        <span className="flex items-center gap-2 justify-center text-primary">
                          <User className="h-4 w-4" />
                          Your move
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 justify-center">
                          <Bot className="h-4 w-4" />
                          AI turn
                        </span>
                      )}
                    </p>
                    {game.inCheck() && (
                      <Badge variant="destructive" className="animate-pulse">
                        Check!
                      </Badge>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Game Controls */}
              <div className="flex flex-wrap gap-3 justify-center">
                {!gameStarted && !showCountdown && (
                  <Button onClick={handleStart} size="lg" className="px-8">
                    <Play className="mr-2 h-4 w-4" />
                    Start Game
                  </Button>
                )}

                {gameStarted && (
                  <>
                    <Button
                      onClick={handleRestart}
                      disabled={isBotThinking}
                      variant="outline"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restart
                    </Button>
                    <Button
                      onClick={handleGiveUp}
                      disabled={
                        isBotThinking || game.isGameOver() || hasGivenUp
                      }
                      variant="destructive"
                    >
                      <Flag className="mr-2 h-4 w-4" />
                      Give Up
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Right Sidebar - Move History */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    Move History
                  </CardTitle>
                  <CardDescription>
                    Game moves in algebraic notation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto space-y-1">
                    {moveHistory.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No moves yet
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 text-sm font-mono">
                        {Array.from(
                          { length: Math.ceil(moveHistory.length / 2) },
                          (_, i) => (
                            <div key={i} className="contents">
                              <span className="text-muted-foreground">
                                {i + 1}.
                              </span>
                              <span className="text-foreground">
                                {moveHistory[i * 2] || ""}
                              </span>
                              <span className="text-foreground">
                                {moveHistory[i * 2 + 1] || ""}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* AI Thinking Progress */}
              {isBotThinking && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4" />
                      AI Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Analyzing positions...</span>
                        <span>Depth {difficulty.depth}</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Game Result Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Game Over
            </DialogTitle>
            <DialogDescription>Here are your game results</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">{status}</p>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Time Played</p>
                  <p className="font-mono font-medium">
                    {formatTime(gameTime)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Moves</p>
                  <p className="font-mono font-medium">
                    {Math.ceil(moveHistory.length / 2)}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-accent/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Rating Change</p>
                <p
                  className={`text-xl font-bold ${ratingChange > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {ratingChange > 0 ? "+" : ""}
                  {ratingChange}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRestart} className="flex-1">
                <Play className="mr-2 h-4 w-4" />
                Play Again
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowResult(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
