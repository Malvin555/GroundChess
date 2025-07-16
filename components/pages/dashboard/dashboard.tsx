"use client";

import type React from "react";
import MultiplayerDialog from "@/components/modal/multiplayer";
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
      const data = await res.json();
      if (data.games) {
        setRecentGames((prev) => [...prev, ...data.games]);
        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error("Error loading games:", err);
    }
    setLoadingMore(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            Welcome back,{" "}
            <span className="capitalize text-primary">
              {user?.username ?? "Player"}
            </span>
            !
          </h1>
          <p className="text-muted-foreground">
            Ready to improve your chess skills today?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow border-border">
            <CardContent className="p-6 text-center space-y-4">
              <Bot className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold text-lg">Play vs AI</h3>
              <p className="text-sm text-muted-foreground">
                Challenge the computer
              </p>
              <Button size="sm" className="w-full" asChild>
                <Link href="/game/vs-bot">
                  <Play className="h-4 w-4 mr-2" />
                  Start Game
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Multiplayer - Open Modal */}
          <Card className="hover:shadow-lg transition-shadow border-border">
            <CardContent className="p-6 text-center space-y-4">
              <Users className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold text-lg">Multiplayer</h3>
              <p className="text-sm text-muted-foreground">
                Play with a friend
              </p>
              <MultiplayerDialog />
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-border">
            <CardContent className="p-6 text-center space-y-4">
              <Target className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold text-lg">Training</h3>
              <p className="text-sm text-muted-foreground">
                Improve your skills
              </p>
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

          <Card className="hover:shadow-lg transition-shadow border-border">
            <CardContent className="p-6 text-center space-y-4">
              <Trophy className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold text-lg">Tournaments</h3>
              <p className="text-sm text-muted-foreground">Compete globally</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Games Played"
            value={stats.totalGames}
            Icon={Trophy}
          />
          <StatCard
            title="Win Rate"
            value={`${stats.winRate}%`}
            Icon={TrendingUp}
          />
          <StatCard
            title="Average Game Time"
            value={`${Math.floor(stats.averageTime / 60)}m ${stats.averageTime % 60}s`}
            Icon={Clock}
          />
        </div>

        {/* Recent Games */}
        <Card className="border-border">
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
                            ? "bg-destructive"
                            : "bg-yellow-500"
                      }`}
                    />
                    <div>
                      <p className="font-medium text-foreground">
                        vs {game.opponent}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(game.time), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{game.result}</p>
                    <p
                      className={`text-sm ${
                        game.rating.startsWith("+")
                          ? "text-green-600"
                          : game.rating.startsWith("-")
                            ? "text-destructive"
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
      </main>
    </div>
  );
}

// StatCard helper
function StatCard({
  title,
  value,
  Icon,
}: {
  title: string;
  value: string | number;
  Icon: React.ElementType;
}) {
  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground">Updated recently</p>
      </CardContent>
    </Card>
  );
}
