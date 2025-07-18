"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, type Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Loader2,
  User,
  Clock,
  Trophy,
  RotateCcw,
  Flag,
  Wifi,
  WifiOff,
  Crown,
} from "lucide-react";
import { Chessboard } from "react-chessboard"; // New import for react-chessboard
import { Chess, type Square } from "chess.js"; // Import Chess and Square for local validation and types
import { Badge } from "@/components/ui/badge"; // Added Badge for status
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"; // Import Dialog components for promotion

interface ChessMove {
  from: string;
  to: string;
  promotion?: string;
}

interface GameState {
  gameId: string;
  playerWhiteId: string | null;
  playerBlackId: string | null;
  playerWhiteUsername: string | null;
  playerBlackUsername: string | null;
  status: string; // "waiting", "playing", "finished", "abandoned"
  fen: string;
  currentTurn: "white" | "black";
  moves: ChessMove[];
  startTime: string;
  endTime: string | null;
  winnerId: string | null;
  loserId: string | null;
  draw: boolean | null;
  yourColor: "white" | "black" | null;
  message?: string; // For game update messages
}

interface GameData {
  gameId: string;
  playerWhiteId: string | null;
  playerBlackId: string | null;
  playerWhite?: { username: string } | null;
  playerBlack?: { username: string } | null;
  status: string;
  fen: string;
  currentTurn: "white" | "black";
  moves: ChessMove[];
  startTime: string;
  endTime: string | null;
  winnerId: string | null;
  loserId: string | null;
  draw: boolean | null;
}

interface ApiResponse {
  game: GameData;
  yourColor: "white" | "black";
  message: string;
}

export default function VsPlayerGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params?.gameId as string;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // Current logged-in user's ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    null,
  ); // State for last move highlighting

  // State for promotion dialog
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [promotionDetails, setPromotionDetails] = useState<{
    from: Square;
    to: Square;
    color: "w" | "b";
  } | null>(null);

  // Fetch current user ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUserId(data.userId);
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        router.push("/login");
      }
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    if (!userId || !gameId) return;

    const connectSocket = async () => {
      const newSocket = io({
        transports: ["websocket"],
        upgrade: false,
      });

      newSocket.on("connect", () => {
        console.log("Connected to socket server.");
        newSocket.emit("joinGame", { gameId, userId });
      });

      newSocket.on("gameJoined", (state: GameState) => {
        console.log("Game joined:", state);
        setGameState(state);
        setLoading(false);
        if (state.status === "waiting") {
          toast("Waiting for opponent", {
            description: "Share this link with a friend to play!",
          });
        }
        // Set last move if available from initial game state
        if (state.moves && state.moves.length > 0) {
          const lastServerMove = state.moves[state.moves.length - 1];
          setLastMove({ from: lastServerMove.from, to: lastServerMove.to });
        }
      });

      newSocket.on("gameStarted", (state: GameState) => {
        console.log("Game started:", state);
        setGameState((prevState) => {
          if (!prevState) return state;
          // Preserve yourColor from the previous state and merge with new state
          const newState = {
            ...prevState,
            ...state,
            yourColor: prevState.yourColor, // Always keep the original yourColor
          };
          return newState;
        });
        toast("Game Started!", {
          description: "Your opponent has joined. Good luck!",
        });
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setElapsedTime((prev) => prev + 1);
        }, 1000);
      });

      newSocket.on(
        "playerJoined",
        (data: {
          playerWhiteId: string;
          playerBlackId: string;
          playerWhiteUsername: string;
          playerBlackUsername: string;
          status?: string;
        }) => {
          console.log("Player joined event received:", data);
          setGameState((prev) => {
            if (!prev) return null;
            // Determine if game should start
            const shouldStartGame =
              data.playerWhiteId &&
              data.playerBlackId &&
              prev.status === "waiting";
            const newState = {
              ...prev,
              playerWhiteId: data.playerWhiteId,
              playerBlackId: data.playerBlackId,
              playerWhiteUsername: data.playerWhiteUsername,
              playerBlackUsername: data.playerBlackUsername,
              status: shouldStartGame ? "playing" : data.status || prev.status,
            };
            if (shouldStartGame) {
              toast("Game Started!", {
                description: "Your opponent has joined. Good luck!",
              });
              if (timerRef.current) clearInterval(timerRef.current);
              timerRef.current = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
              }, 1000);
            } else if (data.playerWhiteId && data.playerBlackId) {
              toast("Opponent Joined!", {
                description: "Your opponent has connected.",
              });
            }
            return newState;
          });
        },
      );

      newSocket.on("gameUpdate", (update: Partial<GameState>) => {
        console.log("Game update received:", update);
        setGameState((prev) => {
          if (!prev) return null;
          const newState = { ...prev, ...update };
          // Update lastMove for highlighting
          if (newState.moves && newState.moves.length > 0) {
            const lastServerMove = newState.moves[newState.moves.length - 1];
            setLastMove({ from: lastServerMove.from, to: lastServerMove.to });
          } else {
            setLastMove(null);
          }
          // Handle status changes
          if (update.status === "playing" && prev.status === "waiting") {
            toast("Game Started!", {
              description: "Your opponent has joined. Good luck!",
            });
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
              setElapsedTime((prev) => prev + 1);
            }, 1000);
          }
          if (newState.status === "finished" && timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            const duration =
              (new Date(newState.endTime!).getTime() -
                new Date(newState.startTime).getTime()) /
              1000;
            setElapsedTime(Math.floor(duration));
            let message = "";
            if (newState.draw) {
              message = "Game ended in a draw!";
            } else if (newState.winnerId === userId) {
              message = "You won!";
            } else if (newState.loserId === userId) {
              message = "You lost!";
            } else {
              message = "Game finished.";
            }
            toast(update.message || message, {
              description: "Game Over!",
              duration: 5000,
            });
          }
          return newState;
        });
      });

      newSocket.on("gameError", (message: string) => {
        console.error("Game error:", message);
        setError(message);
        setLoading(false);
        toast(message, {
          description: "Game Error",
        });
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from socket server.");
        toast("You have been disconnected from the game.", {
          description: "Disconnected",
        });
        if (timerRef.current) clearInterval(timerRef.current);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        if (timerRef.current) clearInterval(timerRef.current);
      };
    };

    const joinGameViaApi = async () => {
      try {
        const res = await fetch(`/api/game/${gameId}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Failed to join game via API.");
        }
        const data: ApiResponse = await res.json();
        console.log("Joined game via API:", data);

        const initialGameState: GameState = {
          gameId: data.game.gameId,
          playerWhiteId: data.game.playerWhiteId,
          playerBlackId: data.game.playerBlackId,
          playerWhiteUsername: data.game.playerWhite?.username || null, // Access nested username
          playerBlackUsername: data.game.playerBlack?.username || null, // Access nested username
          status: data.game.status,
          fen: data.game.fen,
          currentTurn: data.game.currentTurn,
          moves: data.game.moves,
          startTime: data.game.startTime,
          endTime: data.game.endTime,
          winnerId: data.game.winnerId,
          loserId: data.game.loserId,
          draw: data.game.draw,
          yourColor: data.yourColor,
          message: data.message,
        };
        setGameState(initialGameState);
        setLoading(false);

        if (initialGameState.status === "waiting") {
          toast("Waiting for opponent", {
            description: "Share this link with a friend to play!",
          });
        } else if (initialGameState.status === "playing") {
          toast("Game in progress", {
            description: "Both players are connected. Good luck!",
          });
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = setInterval(() => {
            setElapsedTime((prev) => prev + 1);
          }, 1000);
        }

        // Set last move if available from initial game state
        if (initialGameState.moves && initialGameState.moves.length > 0) {
          const lastServerMove =
            initialGameState.moves[initialGameState.moves.length - 1];
          setLastMove({ from: lastServerMove.from, to: lastServerMove.to });
        }

        connectSocket();
      } catch (err: unknown) {
        console.error("Error joining game via API:", err);
        setError((err as Error).message || "Failed to join game.");
        setLoading(false);
      }
    };

    joinGameViaApi();
  }, [gameId, userId, router]);

  useEffect(() => {
    if (gameState?.status === "playing" && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
  }, [gameState?.status]);

  // New onPieceDrop handler for react-chessboard
  const onPieceDrop = useCallback(
    (sourceSquare: Square, targetSquare: Square): boolean => {
      console.log("onPieceDrop called:", sourceSquare, "to", targetSquare);
      console.log("Current gameState:", gameState);
      console.log("Socket connected:", socket?.connected);
      console.log("User ID:", userId);

      if (!gameState) {
        console.log("No game state");
        return false;
      }
      if (gameState.status !== "playing") {
        console.log("Game not in playing state, status:", gameState.status);
        return false;
      }
      if (gameState.currentTurn !== gameState.yourColor) {
        console.log(
          "Not your turn. Current turn:",
          gameState.currentTurn,
          "Your color:",
          gameState.yourColor,
        );
        return false;
      }
      if (!socket || !socket.connected) {
        console.log("Socket not connected");
        return false;
      }

      const chess = new Chess(gameState.fen); // Create a local chess instance for validation
      const piece = chess.get(sourceSquare);

      // Check for promotion
      const isPromotionAttempt =
        piece?.type === "p" &&
        ((piece.color === "w" && targetSquare.includes("8")) ||
          (piece.color === "b" && targetSquare.includes("1")));

      if (isPromotionAttempt) {
        // Find if there's any legal promotion move for this source/target
        const legalPromotionMoves = chess
          .moves({ verbose: true })
          .filter(
            (m) =>
              m.from === sourceSquare &&
              m.to === targetSquare &&
              m.flags.includes("p"),
          );

        if (legalPromotionMoves.length > 0) {
          setPromotionDetails({
            from: sourceSquare,
            to: targetSquare,
            color: piece.color,
          });
          setShowPromotionDialog(true);
          return true; // Accept the drop visually, wait for promotion selection
        } else {
          // If no legal promotion moves for this source/target, it's an invalid drop
          console.error(
            "Invalid promotion attempt: No legal promotion moves found for",
            sourceSquare,
            "to",
            targetSquare,
          );
          return false; // Reject the drop
        }
      }

      // If not a promotion attempt, try a regular move
      try {
        const move = chess.move({ from: sourceSquare, to: targetSquare });
        if (move === null) {
          console.log("Invalid move");
          return false; // Invalid move
        }

        console.log("Emitting regular move to server:", {
          gameId,
          move: { from: sourceSquare, to: targetSquare },
          userId,
        });

        // Emit the move to the server via Socket.IO
        if (socket && userId) {
          socket.emit("makeMove", {
            gameId,
            move: { from: sourceSquare, to: targetSquare },
            userId,
          });
        }
        return true; // Indicate that the move was attempted
      } catch (e) {
        console.error("Local move validation failed:", e);
        return false;
      }
    },
    [gameState, socket, gameId, userId],
  );

  const handlePromotionSelect = useCallback(
    (promotionPiece: "q" | "r" | "b" | "n") => {
      if (!promotionDetails || !socket || !userId || !gameState) return;

      const { from, to } = promotionDetails;
      const gameCopy = new Chess(gameState.fen); // Use current FEN for validation

      try {
        const move = gameCopy.move({
          from,
          to,
          promotion: promotionPiece,
        });

        if (move) {
          // Emit the complete move with promotion to the server
          socket.emit("makeMove", {
            gameId,
            move: { from, to, promotion: promotionPiece },
            userId,
          });
        } else {
          console.error(
            "Failed to apply promotion move locally after selection.",
          );
          toast.error("Invalid promotion move. Please try again.");
        }
      } catch (error) {
        console.error("Error applying promotion move locally:", error);
        toast.error("Error during promotion. Please try again.");
      } finally {
        setShowPromotionDialog(false);
        setPromotionDetails(null);
      }
    },
    [promotionDetails, socket, userId, gameId, gameState],
  );

  const handleGiveUp = () => {
    if (socket && gameState && userId && gameState.status === "playing") {
      if (
        window.confirm(
          "Are you sure you want to give up? Your opponent will win automatically.",
        )
      ) {
        socket.emit("giveUp", { gameId, userId });
      }
    }
  };

  const handleLeaveGame = () => {
    if (socket) {
      socket.disconnect();
    }
    router.push("/");
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-destructive">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="mt-2">{error}</p>
        <Button onClick={() => router.push("/")} className="mt-4">
          Go Home
        </Button>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <p className="text-lg text-muted-foreground">
          No game state available.
        </p>
      </div>
    );
  }

  const isMyTurn = gameState.currentTurn === gameState.yourColor;
  const opponentUsername =
    gameState.yourColor === "white"
      ? gameState.playerBlackUsername
      : gameState.playerWhiteUsername;
  const myUsername =
    gameState.yourColor === "white"
      ? gameState.playerWhiteUsername
      : gameState.playerBlackUsername;

  const customSquareStyles = lastMove
    ? {
        [lastMove.from]: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
        [lastMove.to]: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
      }
    : {};

  const moveHistory = gameState.moves;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <div className="flex items-center gap-2">
        <Crown className="h-6 w-6 text-primary" />
        <CardTitle className="text-2xl font-bold">Multiplayer Chess</CardTitle>
        <Badge variant="outline" className="ml-2">
          Room ID: {gameId}
        </Badge>
      </div>
      <div className="flex items-center gap-2 text-lg font-medium text-muted-foreground">
        <Clock className="h-5 w-5" />
        <span>{formatTime(elapsedTime)}</span>
      </div>
      <CardContent className="grid lg:grid-cols-[1fr_2fr_1fr] gap-6 p-6">
        {/* Left Column: Opponent Info & Game Stats */}
        <div className="flex flex-col gap-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                Opponent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">
                  {opponentUsername || "Waiting..."}
                </span>
                <Badge variant="secondary" className="capitalize">
                  {gameState.yourColor === "white" ? "Black" : "White"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {gameState.playerWhiteId && gameState.playerBlackId ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-destructive" />
                )}
                <span>
                  {gameState.playerWhiteId && gameState.playerBlackId
                    ? "Connected"
                    : "Disconnected"}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                <Trophy className="h-4 w-4" />
                Game Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Moves:</span>
                <span className="font-mono">
                  {Math.ceil(moveHistory.length / 2)}
                </span>
              </div>
              {/* Add more game info here if needed */}
            </CardContent>
          </Card>
        </div>
        {/* Center Column: Chess Board & Main Status */}
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="w-full flex items-center justify-between px-4 py-2 bg-accent rounded-lg text-accent-foreground">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="font-semibold">{myUsername || "You"}</span>
            </div>
            <Badge variant="secondary" className="capitalize">
              {gameState.yourColor}
            </Badge>
          </div>
          <Chessboard
            position={gameState.fen}
            onPieceDrop={onPieceDrop}
            boardWidth={Math.min(
              500,
              typeof window !== "undefined" ? window.innerWidth * 0.7 : 500,
            )}
            arePiecesDraggable={
              gameState.status === "playing" &&
              gameState.currentTurn === gameState.yourColor
            }
            boardOrientation={gameState.yourColor || "white"}
            customBoardStyle={{
              borderRadius: "8px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
              border: "1px solid hsl(var(--border))",
            }}
            customSquareStyles={customSquareStyles}
            animationDuration={300}
          />
          <div className="text-center min-h-[60px] flex flex-col justify-center items-center space-y-2">
            {gameState.status === "waiting" && (
              <div className="space-y-2">
                <p className="text-lg font-medium text-muted-foreground">
                  Waiting for opponent...
                </p>
                <p className="text-sm text-muted-foreground">
                  Share this URL:{" "}
                  <code className="bg-accent p-1 rounded text-sm break-all text-accent-foreground">
                    {typeof window !== "undefined"
                      ? window.location.href
                      : `[your-app-url]/game/vs-player/${gameId}`}
                  </code>
                </p>
              </div>
            )}
            {gameState.status === "playing" && (
              <>
                <p className="text-xl font-semibold">
                  {isMyTurn ? (
                    <span className="text-primary">Your Turn</span>
                  ) : (
                    <span className="text-muted-foreground">
                      Opponent&apos;s Turn
                    </span>
                  )}
                </p>
                {new Chess(gameState.fen).inCheck() && (
                  <Badge variant="destructive" className="animate-pulse">
                    Check!
                  </Badge>
                )}
              </>
            )}
            {gameState.status === "finished" && (
              <div className="space-y-2">
                {gameState.draw ? (
                  <p className="text-xl font-bold text-blue-500">
                    It&apos;s a Draw!
                  </p>
                ) : gameState.winnerId === userId ? (
                  <p className="text-xl font-bold text-green-500">You Won!</p>
                ) : (
                  <p className="text-xl font-bold text-destructive">
                    You Lost!
                  </p>
                )}
                <Button onClick={() => router.push("/")} className="w-full">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Play Again / Go Home
                </Button>
              </div>
            )}
          </div>
          {gameState.status === "playing" && (
            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleGiveUp}
                variant="destructive"
                disabled={gameState.status !== "playing"}
              >
                <Flag className="mr-2 h-4 w-4" />
                Give Up
              </Button>
              <Button onClick={handleLeaveGame} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Leave Game
              </Button>
            </div>
          )}
        </div>
        {/* Right Column: Move History */}
        <div className="flex flex-col gap-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">
                Move History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto text-sm">
                {moveHistory.length === 0 ? (
                  <p className="text-muted-foreground">No moves yet</p>
                ) : (
                  <div className="space-y-1">
                    {Array.from(
                      { length: Math.ceil(moveHistory.length / 2) },
                      (_, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-3 gap-2 font-mono"
                        >
                          <span className="text-muted-foreground">
                            {i + 1}.
                          </span>
                          <span>
                            {moveHistory[i * 2]?.from}-
                            {moveHistory[i * 2]?.to || ""}
                          </span>
                          <span>
                            {moveHistory[i * 2 + 1]?.from}-
                            {moveHistory[i * 2 + 1]?.to || ""}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>

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
