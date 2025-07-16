import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  const faqs = [
    {
      question: "What is GroundChess?",
      answer:
        "GroundChess is an advanced online chess platform designed to help players of all skill levels improve their game. We offer AI opponents, live multiplayer, and soon, personalized training and tournaments.",
    },
    {
      question: "How do I play against the AI?",
      answer:
        "Navigate to the 'Play vs AI' section from the homepage or dashboard. You can select from various difficulty levels to challenge our sophisticated AI engine.",
    },
    {
      question: "How can I play with a friend?",
      answer:
        "Go to the 'Multiplayer' section. You can either create a new private room and share the link with your friend, or join an existing room using a room code.",
    },
    {
      question: "Is GroundChess free to use?",
      answer:
        "Yes, GroundChess offers a robust free tier that includes access to AI games and multiplayer. Premium features and advanced analytics may be available through subscription plans in the future.",
    },
    {
      question: "What if I encounter a bug or have a suggestion?",
      answer:
        "We appreciate your feedback! Please visit our 'Contact Us' page and reach out via email or GitHub. Your input helps us improve the platform.",
    },
  ];

  return (
    <div className="min-h-screen bg-background container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto shadow-lg border-border bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-foreground">
            Frequently Asked Questions
          </CardTitle>
          <p className="text-muted-foreground">
            Find answers to common questions about GroundChess.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-medium text-foreground hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
