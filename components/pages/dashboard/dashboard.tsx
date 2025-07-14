"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Bot,
  Users,
  Play,
} from "lucide-react";
import Link from "next/link";

import { useState } from "react";

type Game = {
  opponent: string;
  result: string;
  rating: string;
  time: string;
};

type DashboardProps = {
  user?: {
    id: string;
    username?: string;
    rating?: number;
  };
  stats: { totalGames: number; winRate: number; averageTime: number };
  initialGames: Game[];
};

export default function DashboardClient({
  user,
  stats,
  initialGames,
}: DashboardProps) {
  const [recentGames, setRecentGames] = useState(initialGames);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadGames = async (offset: number) => {
    setLoadingMore(true);

    try {
      const res = await fetch(`/api/profile/more-games?offset=${offset}`);

      if (!res.ok) {
        console.error("Failed to fetch more games:", await res.text());
        setLoadingMore(false);
        return;
      }

      const data = await res.json();

      if (!data.games) {
        console.error("Response missing games:", data);
        setLoadingMore(false);
        return;
      }

      setRecentGames((prev) => [...prev, ...data.games]);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error("Error loading games:", err);
    }

    setLoadingMore(false);
  };

  return (
    <>
      {/* Welcome Section */}
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back,
              <span className="capitalize">{user?.username ?? "Player"}</span>!
            </h1>
            <p className="text-muted-foreground">
              Ready to improve your chess skills today?
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center space-y-4">
            <Bot className="h-8 w-8 text-blue-500 mx-auto" />
            <div>
              <h3 className="font-semibold">Play vs AI</h3>
              <p className="text-sm text-muted-foreground">
                Challenge the computer
              </p>
            </div>
            <Button size="sm" className="w-full" asChild>
              <Link href="/game/vs-bot">
                <Play className="h-4 w-4 mr-2" />
                Start Game
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center space-y-4">
            <Users className="h-8 w-8 text-green-500 mx-auto" />
            <div>
              <h3 className="font-semibold">Multiplayer</h3>
              <p className="text-sm text-muted-foreground">Play with others</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full bg-transparent"
              asChild
            >
              <Link href="/game/vs-player">Find Match</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center space-y-4">
            <Target className="h-8 w-8 text-purple-500 mx-auto" />
            <div>
              <h3 className="font-semibold">Training</h3>
              <p className="text-sm text-muted-foreground">
                Improve your skills
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full bg-transparent"
              disabled
            >
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center space-y-4">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto" />
            <div>
              <h3 className="font-semibold">Tournaments</h3>
              <p className="text-sm text-muted-foreground">Compete globally</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full bg-transparent"
              disabled
            >
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Games Played</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGames}</div>
            <p className="text-xs text-muted-foreground">+12 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.winRate}%</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Game Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(stats.averageTime / 60)}m {stats.averageTime % 60}s
            </div>
            <p className="text-xs text-muted-foreground">-2m from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Games */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Games</CardTitle>
          <CardDescription>Your latest chess matches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentGames.map((game, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      game.result === "Won"
                        ? "bg-green-500"
                        : game.result === "Lost"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                    }`}
                  />
                  <div>
                    <p className="font-medium">vs {game.opponent}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(game.time), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{game.result}</p>
                  <p
                    className={`text-sm ${
                      game.rating.startsWith("+")
                        ? "text-green-600"
                        : game.rating.startsWith("-")
                          ? "text-red-600"
                          : "text-yellow-600"
                    }`}
                  >
                    {game.rating}
                  </p>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  onClick={() => loadGames(recentGames.length)}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
