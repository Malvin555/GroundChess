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

// Piece-Square Tables (PSTs)
// Values are for white pieces. For black, the board is flipped vertically.
const PAWN_PST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_PST = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

const BISHOP_PST = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

const ROOK_PST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0],
];

const QUEEN_PST = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
];

const KING_PST_MIDDLE = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20],
];

const KING_PST_END = [
  [-50, -40, -30, -20, -20, -30, -40, -50],
  [-30, -20, -10, 0, 0, -10, -20, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -30, 0, 0, 0, 0, -30, -30],
  [-50, -30, -30, -30, -30, -30, -30, -50],
];

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000, // King value is high to represent checkmate
};

function getPST(pieceType: string, isEndgame: boolean) {
  switch (pieceType) {
    case "p":
      return PAWN_PST;
    case "n":
      return KNIGHT_PST;
    case "b":
      return BISHOP_PST;
    case "r":
      return ROOK_PST;
    case "q":
      return QUEEN_PST;
    case "k":
      return isEndgame ? KING_PST_END : KING_PST_MIDDLE;
    default:
      return null;
  }
}

// Enhanced evaluation function
function evaluateBoard(game: Chess): number {
  // Check for terminal states first
  if (game.isCheckmate()) {
    return game.turn() === "w"
      ? Number.NEGATIVE_INFINITY
      : Number.POSITIVE_INFINITY;
  }
  if (
    game.isStalemate() ||
    game.isThreefoldRepetition() ||
    game.isInsufficientMaterial()
  ) {
    return 0; // Draw
  }

  let score = 0;
  const board = game.board();

  let totalQueens = 0;
  let totalRooks = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        if (piece.type === "q") totalQueens++;
        if (piece.type === "r") totalRooks++;
      }
    }
  }
  // Endgame if no queens for either side AND total rooks are low (e.g., 0 or 1)
  const isEndgame = totalQueens === 0 && totalRooks <= 1;

  let whiteBishops = 0;
  let blackBishops = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        const pieceValue = PIECE_VALUES[piece.type];
        const pst = getPST(piece.type, isEndgame);
        // Flip row for black pieces to use the same PSTs
        const row = piece.color === "w" ? r : 7 - r;
        const col = c;

        let positionalValue = 0;
        if (pst) {
          positionalValue = pst[row][col];
        }

        if (piece.color === "w") {
          score += pieceValue + positionalValue;
          if (piece.type === "b") whiteBishops++;
        } else {
          score -= pieceValue + positionalValue;
          if (piece.type === "b") blackBishops++;
        }
      }
    }
  }

  // Bishop pair bonus
  if (whiteBishops >= 2) score += 30;
  if (blackBishops >= 2) score -= 30;

  // Mobility bonus (number of legal moves)
  score += game.moves().length * 10;

  // Check bonus/penalty
  if (game.inCheck()) {
    score += game.turn() === "w" ? -50 : 50; // Penalty for being in check
  }

  return score;
}

function quiescenceSearch(game: Chess, alpha: number, beta: number): number {
  if (game.isGameOver()) {
    return evaluateBoard(game); // Evaluate terminal state
  }

  const standPat = evaluateBoard(game);

  if (standPat >= beta) {
    return beta;
  }
  if (alpha < standPat) {
    alpha = standPat;
  }

  const moves = game.moves({ verbose: true });
  // Filter for capture and en passant moves
  const captureMoves = moves.filter(
    (move) => move.flags.includes("c") || move.flags.includes("e"),
  );

  for (const move of captureMoves) {
    const clone = new Chess(game.fen());
    clone.move(move);
    // Negamax principle: score = -score_of_opponent's_best_move
    const score = -quiescenceSearch(clone, -beta, -alpha);

    if (score >= beta) {
      return beta;
    }
    if (score > alpha) {
      alpha = score;
    }
  }
  return alpha;
}

function minimax(
  game: Chess,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
): { score: number; moves: Move[] } {
  if (depth === 0) {
    return { score: quiescenceSearch(game, alpha, beta), moves: [] }; // Call quiescence search at depth 0
  }
  if (game.isGameOver()) {
    return { score: evaluateBoard(game), moves: [] }; // Game over, evaluate final board
  }

  const moves = game.moves({ verbose: true });
  // Sort moves to improve alpha-beta pruning effectiveness (move ordering)
  // Simple heuristic: captures first, then checks, then promotions
  moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    if (a.flags.includes("c") || a.flags.includes("e")) scoreA += 100; // Capture or en passant
    if (b.flags.includes("c") || b.flags.includes("e")) scoreB += 100;
    if (a.flags.includes("k")) scoreA += 50; // Check
    if (b.flags.includes("k")) scoreB += 50;
    if (a.flags.includes("p")) scoreA += 200; // Promotion
    if (b.flags.includes("p")) scoreB += 200;
    return scoreB - scoreA; // Descending order (best moves first)
  });

  let bestMoves: Move[] = [];

  if (isMaximizing) {
    let maxEval = Number.NEGATIVE_INFINITY;
    for (const move of moves) {
      const clone = new Chess(game.fen());
      clone.move(move);
      const { score } = minimax(clone, depth - 1, false, alpha, beta);
      if (score > maxEval) {
        maxEval = score;
        bestMoves = [move]; // New best score, reset bestMoves
      } else if (score === maxEval) {
        bestMoves.push(move); // Same score, add to bestMoves
      }
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return { score: maxEval, moves: bestMoves };
  } else {
    let minEval = Number.POSITIVE_INFINITY;
    for (const move of moves) {
      const clone = new Chess(game.fen());
      clone.move(move);
      const { score } = minimax(clone, depth - 1, true, alpha, beta);
      if (score < minEval) {
        minEval = score;
        bestMoves = [move]; // New best score, reset bestMoves
      } else if (score === minEval) {
        bestMoves.push(move); // Same score, add to bestMoves
      }
      beta = Math.min(beta, score);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return { score: minEval, moves: bestMoves };
  }
}

function getBestMove(game: Chess, depth: number) {
  if (game.turn() !== "b") return null;
  const { moves } = minimax(
    game,
    depth,
    false, // AI is always minimizing (playing black)
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
  );
  // Pick a random move from the best moves
  if (moves.length > 0) {
    return moves[Math.floor(Math.random() * moves.length)];
  }
  return null;
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
  hard: { depth: 4, rating: 2200, color: "bg-red-500", thinkTime: 2500 }, // Increased depth and rating
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
  const [moveHistory, setMoveHistory] = useState<string[]>(game.history()); // Initialize with game history
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

  // State for promotion dialog
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [promotionDetails, setPromotionDetails] = useState<{
    from: Square;
    to: Square;
    color: "w" | "b";
  } | null>(null);

  // Game timer
  useEffect(() => {
    // Stop timer if game is over OR if player has given up
    if (gameStarted && !game.isGameOver() && !hasGivenUp) {
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
  }, [gameStarted, game, hasGivenUp]); // Added hasGivenUp to dependencies

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
          gameId: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Generate a unique gameId
          result: playerWon
            ? "white"
            : result.includes("Draw")
              ? "draw"
              : "black",
          type: "vsAI",
          duration,
          moves: game.history({ verbose: true }),
          playerColor: "white",
          ratingChange: playerWon ? base : -Math.floor(base / 2),
          difficulty: level, // Include difficulty
          endTime: new Date(), // Set the end time to the current date and time
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
      difficulty.thinkTime + Math.random() * 500, // Add some randomness to thinking time
    );
  }, [difficulty]);

  const onDrop = (source: Square, target: Square): boolean => {
    if (!gameStarted || game.isGameOver() || isBotThinking || hasGivenUp)
      return false;

    const gameCopy = new Chess(game.fen());
    const piece = gameCopy.get(source);

    // Check if it's a pawn promotion move
    const isPromotionAttempt =
      piece?.type === "p" &&
      ((piece.color === "w" && target.includes("8")) ||
        (piece.color === "b" && target.includes("1")));

    if (isPromotionAttempt) {
      // Find if there's any legal promotion move for this source/target
      const legalPromotionMoves = gameCopy
        .moves({ verbose: true })
        .filter(
          (m) => m.from === source && m.to === target && m.flags.includes("p"),
        );

      if (legalPromotionMoves.length > 0) {
        setPromotionDetails({ from: source, to: target, color: piece.color });
        setShowPromotionDialog(true);
        return true; // Accept the drop visually
      } else {
        // If no legal promotion moves for this source/target, it's an invalid drop
        console.error(
          "Invalid promotion attempt: No legal promotion moves found for",
          source,
          "to",
          target,
        );
        return false; // Reject the drop
      }
    }

    // If not a promotion attempt, try a regular move
    try {
      const move = gameCopy.move({ from: source, to: target });
      if (!move) return false; // Move is illegal, piece snaps back

      setGame(gameCopy); // Update game state
      setMoveHistory(gameCopy.history());
      setLastMove({ from: source, to: target });

      if (!gameCopy.isGameOver()) {
        setTimeout(() => makeBotMove(), 100);
      }
      return true; // Move was successful
    } catch (e) {
      console.error("Invalid regular move:", e);
      return false; // Move is illegal, piece snaps back
    }
  };

  const handlePromotionSelect = (promotionPiece: "q" | "r" | "b" | "n") => {
    if (!promotionDetails) return;

    // Use the current game state to apply the promotion move
    setGame((prevGame) => {
      const gameCopy = new Chess(prevGame.fen()); // Create a copy from the *previous* state
      try {
        const move = gameCopy.move({
          from: promotionDetails.from,
          to: promotionDetails.to,
          promotion: promotionPiece,
        });

        if (move) {
          setMoveHistory(gameCopy.history());
          setLastMove({ from: promotionDetails.from, to: promotionDetails.to });
          if (!gameCopy.isGameOver()) {
            setTimeout(() => makeBotMove(), 100);
          }
          return gameCopy; // Return the new game state
        } else {
          console.error("Failed to apply promotion move after selection.");
          return prevGame; // Revert to previous state if move fails
        }
      } catch (error) {
        console.error("Error applying promotion move:", error);
        return prevGame; // Revert to previous state on error
      } finally {
        setShowPromotionDialog(false);
        setPromotionDetails(null);
      }
    });
  };

  const handleStart = () => {
    setGame(new Chess()); // Reset game state on start
    setStatus(null);
    setIsBotThinking(false);
    setGameStarted(false);
    setShowResult(false);
    setShowCountdown(true);
    setCountdown(3);
    setGameTime(0);
    setMoveHistory([]);
    setLastMove(null);
    setHasGivenUp(false);
    startTimeRef.current = null;
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }
  };

  const handleRestart = () => {
    setGame(new Chess());
    setStatus(null);
    setIsBotThinking(false);
    setGameStarted(false);
    setShowResult(false);
    setShowCountdown(false);
    setGameTime(0);
    setMoveHistory([]); // Reset move history
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
    // Explicitly stop the timer here
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }
    const duration = Math.floor(
      (Date.now() - (startTimeRef.current ?? Date.now())) / 1000,
    );
    try {
      await fetch("/api/game/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Generate a unique gameId
          result: "black", // AI wins
          type: "vsAI",
          duration,
          moves: game.history({ verbose: true }),
          playerColor: "white",
          ratingChange: -Math.floor(
            difficultyRatingMap[level as keyof typeof difficultyRatingMap] / 2,
          ),
          difficulty: level, // Include difficulty
          endTime: new Date(), // Set the end time to the current date and time
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
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-muted-foreground">
                      <Target className="h-5 w-5" />
                      Select Difficulty
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select
                      value={selectedDifficulty}
                      onValueChange={setSelectedDifficulty}
                    >
                      <SelectTrigger className="w-full">
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
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-muted-foreground">
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
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-muted-foreground">
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
                      !game.isGameOver() &&
                      !hasGivenUp && <Badge variant="default">Your Turn</Badge>}
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
              <Card className="p-4 border-border">
                <div ref={boardRef}>
                  <Chessboard
                    position={game.fen()}
                    onPieceDrop={onDrop}
                    boardWidth={Math.min(
                      380,
                      typeof window !== "undefined"
                        ? window.innerWidth * 0.7
                        : 500,
                    )}
                    // Updated arePiecesDraggable to include !hasGivenUp
                    arePiecesDraggable={
                      gameStarted &&
                      !game.isGameOver() &&
                      !isBotThinking &&
                      !hasGivenUp
                    }
                    boardOrientation="white"
                    customBoardStyle={{
                      borderRadius: "12px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                      border: "1px solid hsl(var(--border))",
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
                        <span className="flex items-center gap-2 justify-center text-muted-foreground">
                          <Brain className="h-4 w-4 animate-pulse" />
                          AI is thinking...
                        </span>
                      ) : game.turn() === "w" ? (
                        <span className="flex items-center gap-2 justify-center text-primary">
                          <User className="h-4 w-4" />
                          Your move
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 justify-center text-muted-foreground">
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
                      // Disable if bot is thinking, game is over, or already given up
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
            {/* Right Sidebar - Move History & AI Thinking Progress */}
            <div className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-muted-foreground">
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
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
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
                  className={`text-xl font-bold ${ratingChange > 0 ? "text-green-600" : "text-destructive"}`}
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

      {/* Promotion Dialog */}
      <Dialog open={showPromotionDialog} onOpenChange={setShowPromotionDialog}>
        <DialogContent className="sm:max-w-[300px]">
          <DialogHeader>
            <DialogTitle>Pawn Promotion</DialogTitle>
            <DialogDescription>
              Select a piece to promote your pawn to.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => handlePromotionSelect("q")}>Queen</Button>
            <Button onClick={() => handlePromotionSelect("r")}>Rook</Button>
            <Button onClick={() => handlePromotionSelect("b")}>Bishop</Button>
            <Button onClick={() => handlePromotionSelect("n")}>Knight</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
