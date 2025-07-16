import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto shadow-lg border-border bg-card">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-foreground">
            Terms of Service
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <p>
            Welcome to GroundChess! These Terms of Service (&quot;Terms&quot;)
            govern your use of the GroundChess website and services (the
            &quot;Service&quot;). By accessing or using the Service, you agree
            to be bound by these Terms.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            1. Acceptance of Terms
          </h2>
          <p>
            By creating an account or using the Service, you agree to these
            Terms and our Privacy Policy. If you do not agree to these Terms, do
            not use the Service.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            2. User Accounts
          </h2>
          <p>
            When you create an account with us, you must provide us with
            information that is accurate, complete, and current at all times.
            Failure to do so constitutes a breach of the Terms, which may result
            in immediate termination of your account on our Service. You are
            responsible for safeguarding the password that you use to access the
            Service and for any activities or actions under your password.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            3. Prohibited Uses
          </h2>
          <p>
            You may use the Service only for lawful purposes and in accordance
            with the Terms. You agree not to use the Service:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              In any way that violates any applicable national or international
              law or regulation.
            </li>
            <li>
              For the purpose of exploiting, harming, or attempting to exploit
              or harm minors in any way.
            </li>
            <li>
              To transmit, or procure the sending of, any advertising or
              promotional material, including any &quot;junk mail,&quot;
              &quot;chain letter,&quot; &quot;spam,&quot; or any other similar
              solicitation.
            </li>
            <li>
              To impersonate or attempt to impersonate GroundChess, a
              GroundChess employee, another user, or any other person or entity.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground">
            4. Termination
          </h2>
          <p>
            We may terminate or suspend your account immediately, without prior
            notice or liability, for any reason whatsoever, including without
            limitation if you breach the Terms.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            5. Governing Law
          </h2>
          <p>
            These Terms shall be governed and construed in accordance with the
            laws of [Your Jurisdiction], without regard to its conflict of law
            provisions.
          </p>

          <p className="mt-8">
            If you have any questions about these Terms, please contact us at{" "}
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
