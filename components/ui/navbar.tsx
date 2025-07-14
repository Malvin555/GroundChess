"use client";

import type React from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Crown,
  User,
  LogOut,
  Menu,
  Home,
  BarChart3,
  Bot,
  Users,
  Settings,
  UserCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

type NavbarProps = {
  isLoggedIn: boolean;
};

export function Navbar({ isLoggedIn }: NavbarProps) {
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth/login";
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Enhanced Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 group hover:scale-105 transition-transform duration-200"
          >
            <div className="relative">
              <Crown className="h-8 w-8 text-primary group-hover:text-primary/80 transition-colors" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary/20 rounded-full animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                ChessHub
              </span>
              <span className="text-xs text-muted-foreground -mt-1">
                Master Your Game
              </span>
            </div>
          </Link>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <NavLink href="/" icon={Home}>
              Home
            </NavLink>
            {isLoggedIn && (
              <>
                <NavLink href="/dashboard" icon={BarChart3}>
                  Dashboard
                </NavLink>
                <NavLink href="/game/vs-bot" icon={Bot}>
                  vs Bot
                  <Badge variant="secondary" className="ml-2 text-xs">
                    AI
                  </Badge>
                </NavLink>
                <NavLink href="/game/vs-player" icon={Users}>
                  Multiplayer
                  <Badge variant="outline" className="ml-2 text-xs">
                    Live
                  </Badge>
                </NavLink>
              </>
            )}
          </div>

          {/* Enhanced Auth Section */}
          <div className="flex items-center space-x-3">
            {isLoggedIn && (
              <>
                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2 hover:bg-accent/50 transition-colors duration-200 px-3 py-2 rounded-lg"
                    >
                      <div className="relative">
                        <User className="h-4 w-4" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-background" />
                      </div>
                      <span className="hidden sm:inline font-medium">
                        Player
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2">
                    <div className="flex items-center space-x-2 p-2 mb-2 bg-accent/30 rounded-lg">
                      <UserCircle className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Chess Player</p>
                        <p className="text-xs text-muted-foreground">
                          Rating: 1200
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link
                        href="/dashboard"
                        className="flex items-center space-x-2"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <UserCircle className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive cursor-pointer focus:text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Enhanced Mobile Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="lg:hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-accent/50 transition-colors duration-200 p-2"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2">
                    <div className="space-y-1">
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link
                          href="/"
                          className="flex items-center space-x-3 p-2"
                        >
                          <Home className="h-4 w-4" />
                          <span>Home</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-3 p-2"
                        >
                          <BarChart3 className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link
                          href="/game/vs-bot"
                          className="flex items-center space-x-3 p-2"
                        >
                          <Bot className="h-4 w-4" />
                          <span>Play vs Bot</span>
                          <Badge
                            variant="secondary"
                            className="ml-auto text-xs"
                          >
                            AI
                          </Badge>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link
                          href="/game/vs-player"
                          className="flex items-center space-x-3 p-2"
                        >
                          <Users className="h-4 w-4" />
                          <span>Multiplayer</span>
                          <Badge variant="outline" className="ml-auto text-xs">
                            Live
                          </Badge>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            {!isLoggedIn && (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild variant="default" size="sm">
                  <Link href="/auth/signup">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Enhanced NavLink Component
function NavLink({
  href,
  children,
  icon: Icon,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ElementType;
}) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent/50 rounded-lg transition-all duration-200 group"
    >
      <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
      <span>{children}</span>
    </Link>
  );
}
