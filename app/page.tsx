import type React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Bot,
  Users,
  Trophy,
  Zap,
  Shield,
  TrendingUp,
  Star,
  Play,
  ArrowRight,
  CheckCircle,
  Target,
  Brain,
  Globe,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* Enhanced Hero Section */}
      <section className="text-center space-y-8 py-16 relative">
        <div className="absolute top-10 left-10 text-6xl opacity-10 rotate-12">
          ♔
        </div>
        <div className="absolute top-20 right-16 text-4xl opacity-10 -rotate-12">
          ♛
        </div>
        <div className="absolute bottom-10 left-20 text-5xl opacity-10 rotate-45">
          ♞
        </div>

        <div className="space-y-6 relative z-10">
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
            🏆 #1 Chess Training Platform
          </Badge>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Master Chess
            </span>
            <br />
            <span className="text-foreground/90">Like Never Before</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Challenge AI opponents, compete with players worldwide, and unlock
            your chess potential with our
            <span className="text-primary font-semibold">
              {" "}
              advanced training platform
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Button
            size="lg"
            className="group px-8 py-6 text-lg font-semibold"
            asChild
          >
            <Link href="/auth/signup">
              <Crown className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              Start Your Journey
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="group px-8 py-6 text-lg bg-transparent"
            asChild
          >
            <Link href="/game/vs-bot">
              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              See More
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-16">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary">
              50K+
            </div>
            <div className="text-sm text-muted-foreground">Active Players</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary">
              1M+
            </div>
            <div className="text-sm text-muted-foreground">Games Played</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary">
              95%
            </div>
            <div className="text-sm text-muted-foreground">
              Improvement Rate
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Choose Your <span className="text-primary">Battle</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Multiple ways to challenge yourself and improve your skills
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Bot}
            title="AI Opponents"
            description="Challenge sophisticated AI with 10 difficulty levels, from beginner to grandmaster"
            features={[
              "Adaptive difficulty",
              "Instant feedback",
              "24/7 availability",
            ]}
            buttonText="Challenge AI"
            buttonHref="/game/vs-bot"
            iconColor="text-blue-500"
            badge="Smart AI"
          />

          <FeatureCard
            icon={Users}
            title="Live Multiplayer"
            description="Play real-time games with players worldwide, matched by skill level"
            features={[
              "Skill-based matching",
              "Global leaderboards",
              "Real-time chat",
            ]}
            buttonText="Find Opponent"
            buttonHref="/game/vs-player"
            iconColor="text-green-500"
            badge="Live"
            highlighted
          />

          <FeatureCard
            icon={Trophy}
            title="Tournaments"
            description="Compete in daily tournaments and seasonal championships"
            features={["Daily tournaments", "Prize pools", "Rating system"]}
            buttonText="Coming Soon"
            buttonHref="#"
            iconColor="text-yellow-500"
            badge="Soon"
            disabled
          />
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-3xl" />
        <div className="relative p-8 md:p-16 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Why <span className="text-primary">ChessHub</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience chess with cutting-edge technology and proven training
              methods
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <BenefitCard
              icon={Zap}
              title="Lightning Fast"
              description="Sub-100ms response times for seamless real-time gameplay"
              iconColor="text-yellow-500"
            />
            <BenefitCard
              icon={Shield}
              title="Fair Play Guaranteed"
              description="Advanced anti-cheat system with 99.9% accuracy detection"
              iconColor="text-green-500"
            />
            <BenefitCard
              icon={Brain}
              title="AI-Powered Analysis"
              description="Deep learning algorithms analyze every move for improvement insights"
              iconColor="text-purple-500"
            />
            <BenefitCard
              icon={Target}
              title="Personalized Training"
              description="Adaptive learning paths tailored to your skill level and goals"
              iconColor="text-red-500"
            />
            <BenefitCard
              icon={Globe}
              title="Global Community"
              description="Connect with chess enthusiasts from 150+ countries worldwide"
              iconColor="text-blue-500"
            />
            <BenefitCard
              icon={TrendingUp}
              title="Track Progress"
              description="Detailed statistics and performance analytics to monitor growth"
              iconColor="text-indigo-500"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Loved by <span className="text-primary">Chess Players</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            See what our community says about their experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Chen",
              rating: "1850 → 2100",
              text: "ChessHub's AI training helped me break through my plateau. The personalized feedback is incredible!",
              avatar: "SC",
            },
            {
              name: "Marcus Rodriguez",
              rating: "1200 → 1650",
              text: "As a beginner, the adaptive difficulty made learning enjoyable. I'm now competing in tournaments!",
              avatar: "MR",
            },
            {
              name: "Elena Petrov",
              rating: "2200 → 2400",
              text: "The analysis tools are professional-grade. It's like having a grandmaster coach available 24/7.",
              avatar: "EP",
            },
          ].map((testimonial, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-primary">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.rating}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground italic">
                  &quot;{testimonial.text}&quot;
                </p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
        <div className="absolute top-0 right-0 text-9xl opacity-10 text-white">
          ♔
        </div>
        <div className="absolute bottom-0 left-0 text-7xl opacity-10 text-white">
          ♛
        </div>

        <div className="relative text-center p-8 md:p-16 space-y-8 text-white">
          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            Ready to Become a
            <br />
            <span className="text-yellow-300">Chess Master?</span>
          </h2>

          <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
            Join 50,000+ players who&apos;ve already started their journey to
            chess mastery
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              variant="secondary"
              className="px-8 py-6 text-lg font-semibold"
              asChild
            >
              <Link href="/auth/signup">
                <Crown className="mr-2 h-5 w-5" />
                Start Free Today
              </Link>
            </Button>

            <div className="flex items-center space-x-2 text-sm opacity-80">
              <CheckCircle className="h-4 w-4" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// Enhanced Feature Card Component
function FeatureCard({
  icon: Icon,
  title,
  description,
  features,
  buttonText,
  buttonHref,
  iconColor,
  badge,
  highlighted = false,
  disabled = false,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonHref: string;
  iconColor: string;
  badge?: string;
  highlighted?: boolean;
  disabled?: boolean;
}) {
  return (
    <Card
      className={`relative group hover:shadow-xl transition-all duration-300 ${
        highlighted
          ? "ring-2 ring-primary shadow-lg scale-105"
          : "hover:scale-105"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center space-y-4">
        <div className="relative mx-auto">
          <Icon
            className={`h-16 w-16 ${iconColor} mx-auto group-hover:scale-110 transition-transform duration-300`}
          />
          {badge && (
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-2 text-xs"
            >
              {badge}
            </Badge>
          )}
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center space-x-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          variant={highlighted ? "default" : "outline"}
          className="w-full"
          asChild={!disabled}
          disabled={disabled}
        >
          {disabled ? (
            <span>{buttonText}</span>
          ) : (
            <Link href={buttonHref}>{buttonText}</Link>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// Benefit Card Component
function BenefitCard({
  icon: Icon,
  title,
  description,
  iconColor,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  iconColor: string;
}) {
  return (
    <div className="group text-center space-y-4 p-6 rounded-xl hover:bg-accent/50 transition-colors duration-300">
      <Icon
        className={`h-12 w-12 ${iconColor} mx-auto group-hover:scale-110 transition-transform duration-300`}
      />
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
