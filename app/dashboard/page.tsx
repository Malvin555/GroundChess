"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { AIDifficultyModal } from "@/components/modal/ai-select";

export default function DashboardPage() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, Player!</h1>
              <p className="text-muted-foreground">
                Ready to improve your chess skills today?
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center space-y-4">
              <Bot className="h-8 w-8 text-blue-500 mx-auto" />
              <div>
                <h3 className="font-semibold">Play vs AI</h3>
                <p className="text-sm text-muted-foreground">
                  Challenge the computer
                </p>
              </div>
              <Button
                size="sm"
                className="w-full"
                onClick={() => setOpenModal(true)}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Game
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center space-y-4">
              <Users className="h-8 w-8 text-green-500 mx-auto" />
              <div>
                <h3 className="font-semibold">Multiplayer</h3>
                <p className="text-sm text-muted-foreground">
                  Play with others
                </p>
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
                <p className="text-sm text-muted-foreground">
                  Compete globally
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
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Games Played
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">
                +12 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68%</div>
              <p className="text-xs text-muted-foreground">
                +5% from last week
              </p>
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
              <div className="text-2xl font-bold">12m</div>
              <p className="text-xs text-muted-foreground">
                -2m from last week
              </p>
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
              {[
                {
                  opponent: "AI Level 3",
                  result: "Won",
                  time: "2 hours ago",
                  rating: "+15",
                },
                {
                  opponent: "Player_123",
                  result: "Lost",
                  time: "1 day ago",
                  rating: "-12",
                },
                {
                  opponent: "AI Level 2",
                  result: "Won",
                  time: "2 days ago",
                  rating: "+10",
                },
                {
                  opponent: "ChessMaster",
                  result: "Draw",
                  time: "3 days ago",
                  rating: "+2",
                },
              ].map((game, index) => (
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
                        {game.time}
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
            </div>
          </CardContent>
        </Card>
      </div>
      <AIDifficultyModal open={openModal} onClose={() => setOpenModal(false)} />
    </>
  );
}
