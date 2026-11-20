import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeader, pageHead } from "@/features/workpassport/shared";
import { useHelp } from "@/features/workpassport/help";
import { faq } from "@/features/workpassport/assistant";
export const Route = createFileRoute("/help")({
  head: () =>
    pageHead(
      "Help & guidance",
      "Simple answers about WorkPassport registration, jobs, hiring, quotations and honest verification.",
    ),
  component: HelpPage,
});
function HelpPage() {
  const open = useHelp();
  return (
    <main className="container page-main">
      <PageHeader
        title="A little help for your next step"
        description="Take your time. You can learn about the platform before joining."
      />
      <Button onClick={() => open()} size="lg">
        Ask WorkPassport
      </Button>
      <div className="faq-list">
        {faq.map((f) => (
          <details key={f.question}>
            <summary>{f.question}</summary>
            <p>{f.answer}</p>
          </details>
        ))}
      </div>
      <div className="notice">
        The guide uses WorkPassport’s written answers. When your browser has a compatible AI model ready, it can match a question to an answer on your device.
      </div>
    </main>
  );
}
