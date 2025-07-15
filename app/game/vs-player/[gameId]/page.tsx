"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, type Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";
import { Chessboard } from "react-chessboard"; // New import for react-chessboard
import { Chess, type Square } from "chess.js"; // Import Chess and Square for local validation and types

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
        transports: ['websocket'],
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
      try {
        const move = chess.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        }); // Default to queen promotion
        if (move === null) {
          console.log("Invalid move");
          return false; // Invalid move
        }

        console.log("Emitting move to server:", {
          gameId,
          move: { from: sourceSquare, to: targetSquare, promotion: "q" },
          userId,
        });

        // Emit the move to the server via Socket.IO
        if (socket && userId) {
          socket.emit("makeMove", {
            gameId,
            move: { from: sourceSquare, to: targetSquare, promotion: "q" },
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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
          Loading game...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-red-600">
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-gray-700 dark:text-gray-300">
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-2xl font-bold">
            Chess Hub: VS Player
          </CardTitle>
          <div className="text-lg font-medium">
            Time: {formatTime(elapsedTime)}
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span className="font-semibold">
                  {opponentUsername || "Waiting for opponent..."} (
                  {gameState.yourColor === "white" ? "Black" : "White"})
                </span>
              </div>
            </div>
            {/* Debug info */}
            <div className="mb-4 p-2 bg-gray-200 dark:bg-gray-800 rounded text-sm">
              <p>Status: {gameState.status}</p>
              <p>Your Color: {gameState.yourColor}</p>
              <p>Current Turn: {gameState.currentTurn}</p>
              <p>Is My Turn: {isMyTurn ? "Yes" : "No"}</p>
              <p>Socket Connected: {socket?.connected ? "Yes" : "No"}</p>
              <p>
                Pieces Draggable:{" "}
                {gameState.status === "playing" &&
                gameState.currentTurn === gameState.yourColor
                  ? "Yes"
                  : "No"}
              </p>
            </div>
            {/* Replaced custom ChessBoard with react-chessboard */}
            <Chessboard
              position={gameState.fen}
              onPieceDrop={onPieceDrop}
              boardWidth={Math.min(
                400,
                typeof window !== "undefined" ? window.innerWidth - 100 : 500,
              )}
              arePiecesDraggable={
                gameState.status === "playing" &&
                gameState.currentTurn === gameState.yourColor
              }
              boardOrientation={gameState.yourColor || "white"}
              customBoardStyle={{
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              }}
              customSquareStyles={customSquareStyles}
              animationDuration={300}
            />
            <div className="flex items-center justify-between w-full mt-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span className="font-semibold">
                  {myUsername || "You"} ({gameState.yourColor})
                </span>
              </div>
            </div>
          </div>
          <div className="md:col-span-1 flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Game Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">
                  Status: <span className="capitalize">{gameState.status}</span>
                </p>
                {gameState.status === "waiting" && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Share this URL with your friend: <br />
                    <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded text-sm break-all">
                      {typeof window !== "undefined"
                        ? window.location.href
                        : `[your-app-url]/game/vs-player/${gameId}`}
                    </code>
                  </p>
                )}
                {gameState.status === "playing" && (
                  <p className="text-lg font-medium mt-2">
                    Turn:{" "}
                    <span
                      className={isMyTurn ? "text-green-500" : "text-red-500"}
                    >
                      {isMyTurn ? "Your Turn" : "Opponent's Turn"}
                    </span>
                  </p>
                )}
                {gameState.status === "finished" && (
                  <div className="mt-2">
                    {gameState.draw ? (
                      <p className="text-xl font-bold text-blue-500">
                        It&apos;s a Draw!
                      </p>
                    ) : gameState.winnerId === userId ? (
                      <p className="text-xl font-bold text-green-500">
                        You Won!
                      </p>
                    ) : (
                      <p className="text-xl font-bold text-red-500">
                        You Lost!
                      </p>
                    )}
                    <Button
                      onClick={() => router.push("/")}
                      className="mt-4 w-full"
                    >
                      Play Again / Go Home
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            {gameState.status === "playing" && (
              <Button
                onClick={handleGiveUp}
                variant="destructive"
                className="w-full"
                disabled={gameState.status !== "playing"}
              >
                Give Up
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
