import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Github, Instagram } from "lucide-react";

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-background container mx-auto px-4 py-8">
      <Card className="w-full max-w-3xl mx-auto shadow-lg border-border bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-foreground">
            Contact Us
          </CardTitle>
          <p className="text-muted-foreground">
            We`&apos;d love to hear from you!
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-lg border border-border">
              <Mail className="h-10 w-10 text-primary mb-3" />
              <h3 className="text-xl font-semibold text-foreground">Email</h3>
              <p className="text-muted-foreground">
                For general inquiries and support.
              </p>
              <a
                href="mailto:kerta.mudiarta@example.com" // Placeholder email, replace with actual
                className="mt-3 text-primary hover:underline font-medium"
              >
                malvinbrine555@gmail.com
              </a>
            </div>

            {/* GitHub */}
            <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-lg border border-border">
              <Github className="h-10 w-10 text-primary mb-3" />
              <h3 className="text-xl font-semibold text-foreground">GitHub</h3>
              <p className="text-muted-foreground">
                Check out my projects and contributions.
              </p>
              <a
                href="https://github.com/Malvin555"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-primary hover:underline font-medium"
              >
                Malvin555
              </a>
            </div>

            {/* Instagram */}
            <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-lg border border-border md:col-span-2">
              <Instagram className="h-10 w-10 text-primary mb-3" />
              <h3 className="text-xl font-semibold text-foreground">
                Instagram
              </h3>
              <p className="text-muted-foreground">
                Follow me for updates and more.
              </p>
              <a
                href="https://instagram.com/kerta.mudiarta" // Placeholder Instagram, replace with actual
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-primary hover:underline font-medium"
              >
                @kerta.mudiarta
              </a>
            </div>
          </div>

          <div className="text-center text-muted-foreground">
            <p>We aim to respond to all inquiries within 24-48 hours.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
