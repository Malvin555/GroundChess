import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto shadow-lg border-border bg-card">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-foreground">
            Privacy Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <p>
            This Privacy Policy describes how GroundChess (&quot;we,&quot;
            &quot;us,&quot; or &quot;our&quot;) collects, uses, and discloses
            your information when you use our website and services (the
            &quot;Service&quot;).
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            1. Information We Collect
          </h2>
          <p>
            We collect various types of information in connection with the
            services, including:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Personal Data:</strong> Email address, username, and
              password (hashed).
            </li>
            <li>
              <strong>Usage Data:</strong> Information on how the Service is
              accessed and used (e.g., game history, moves, time played).
            </li>
            <li>
              <strong>Technical Data:</strong> IP address, browser type,
              operating system.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground">
            2. How We Use Your Information
          </h2>
          <p>We use the collected data for various purposes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>To provide and maintain our Service.</li>
            <li>To notify you about changes to our Service.</li>
            <li>
              To allow you to participate in interactive features of our Service
              when you choose to do so.
            </li>
            <li>To provide customer support.</li>
            <li>To monitor the usage of our Service.</li>
            <li>To detect, prevent and address technical issues.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground">
            3. Data Security
          </h2>
          <p>
            The security of your data is important to us, but remember that no
            method of transmission over the Internet, or method of electronic
            storage is 100% secure. While we strive to use commercially
            acceptable means to protect your Personal Data, we cannot guarantee
            its absolute security.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            4. Changes to This Privacy Policy
          </h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page.
            You are advised to review this Privacy Policy periodically for any
            changes.
          </p>

          <p className="mt-8">
            If you have any questions about this Privacy Policy, please contact
            us at{" "}
            <Link href="/contact" className="text-primary hover:underline">
              our contact page
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
