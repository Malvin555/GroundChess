"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TriangleAlert, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg border-border bg-card">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <TriangleAlert className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            Oops! Something Went Wrong.
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-lg">
            We&apos;re sorry, but an unexpected error occurred.
            <br />
            Our team has been notified. Please try again or go back to the
            homepage.
          </p>
          {/* Optional: Display error details in development */}
          {process.env.NODE_ENV === "development" && (
            <div className="bg-muted/50 p-4 rounded-md text-sm text-muted-foreground text-left overflow-auto max-h-40">
              <p className="font-semibold">Error Details:</p>
              <pre className="whitespace-pre-wrap break-all">
                {error.message}
              </pre>
              {error.digest && <p className="mt-2">Digest: {error.digest}</p>}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => reset()} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button asChild variant="outline" className="flex-1 bg-transparent">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
