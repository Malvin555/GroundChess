import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Crown, Bot, Users, Trophy, Zap, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-16">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Master Chess Online
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Challenge AI opponents, play with friends, or compete in
            tournaments. Improve your chess skills with our advanced platform.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/auth/signup">
              <Crown className="mr-2 h-5 w-5" />
              Start Playing
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/game/vs-bot">
              <Bot className="mr-2 h-5 w-5" />
              Play vs AI
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardHeader>
            <Bot className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>AI Opponents</CardTitle>
            <CardDescription>
              Challenge sophisticated AI with adjustable difficulty levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link href="/game/vs-bot">Play vs Bot</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardHeader>
            <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle>Multiplayer</CardTitle>
            <CardDescription>
              Play real-time games with players from around the world
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link href="/game/vs-player">Find Opponent</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardHeader>
            <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle>Tournaments</CardTitle>
            <CardDescription>
              Compete in tournaments and climb the leaderboards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose ChessHub?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience chess like never before with our cutting-edge platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <Zap className="h-10 w-10 text-yellow-500 mx-auto" />
            <h3 className="text-xl font-semibold">Lightning Fast</h3>
            <p className="text-gray-600">
              Real-time gameplay with minimal latency for the best experience
            </p>
          </div>

          <div className="text-center space-y-4">
            <Shield className="h-10 w-10 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold">Fair Play</h3>
            <p className="text-gray-600">
              Advanced anti-cheat system ensures fair and competitive games
            </p>
          </div>

          <div className="text-center space-y-4">
            <Crown className="h-10 w-10 text-purple-500 mx-auto" />
            <h3 className="text-xl font-semibold">Skill Building</h3>
            <p className="text-gray-600">
              Detailed analysis and insights to help improve your game
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-gradient-to-r from-secondary to-primary rounded-2xl p-8 md:p-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Ready to Begin Your Chess Journey?
        </h2>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
          Join thousands of players and start improving your chess skills today
        </p>
        <Button size="lg" asChild>
          <Link href="/auth/signup">Create Free Account</Link>
        </Button>
      </section>
    </div>
  );
}
