"use client";

import Link from "next/link";
import { Crown, Github, Twitter, Linkedin, Mail } from "lucide-react"; // Added social icons

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {/* Brand and Description */}
        <div className="space-y-4">
          <Link
            href="/"
            className="flex items-center space-x-2 group hover:scale-105 transition-transform duration-200"
          >
            <Crown className="h-8 w-8 text-primary group-hover:text-primary/80 transition-colors" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              GroundChess
            </span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">
            Master your game with advanced AI opponents, live multiplayer, and
            personalized training.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Quick Links</h3>
          <nav className="flex flex-col space-y-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/game/vs-bot"
              className="hover:text-primary transition-colors"
            >
              Play vs AI
            </Link>
            <Link
              href="/game/vs-player"
              className="hover:text-primary transition-colors"
            >
              Multiplayer
            </Link>
          </nav>
        </div>

        {/* Legal & Support */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Legal & Support
          </h3>
          <nav className="flex flex-col space-y-2 text-sm text-muted-foreground">
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/contact"
              className="hover:text-primary transition-colors"
            >
              Contact Us
            </Link>
            <Link href="/faq" className="hover:text-primary transition-colors">
              FAQ
            </Link>
          </nav>
        </div>

        {/* Connect With Us */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Connect With Us
          </h3>
          <div className="flex space-x-4">
            <a
              href="#"
              aria-label="GitHub"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="h-6 w-6" />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Twitter className="h-6 w-6" />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Linkedin className="h-6 w-6" />
            </a>
            <a
              href="#"
              aria-label="Email"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="h-6 w-6" />
            </a>
          </div>
          {/* Optional: Newsletter Signup */}
          {/* <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Stay updated with our newsletter!</p>
            <div className="flex gap-2">
              <Input type="email" placeholder="Your email" className="flex-grow" />
              <Button size="sm">Subscribe</Button>
            </div>
          </div> */}
        </div>
      </div>

      {/* Copyright */}
      <div className="container mx-auto text-center mt-12 pt-8 border-t border-border">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} GroundChess. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
