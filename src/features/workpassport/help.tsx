import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { faq, localAssistant, pageHint } from "./assistant";
const HelpContext = createContext<(() => void) | null>(null);
export function useHelp() {
  const open = useContext(HelpContext);
  return open ?? (() => {});
}
export function HelpProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ question: string; answer: string }[]>([]);
  const logEnd = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logEnd.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const path = useRouterState({ select: (s) => s.location.pathname });
  async function ask(q: string) {
    if (!q.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const reply = await localAssistant.ask({ question: q, path });
      setMessages((m) => [...m, { question: q, answer: reply.answer }]);
      setQuestion("");
    } catch {
      setError("Help could not answer. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <HelpContext.Provider value={() => setOpen(true)}>
      {children}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <Button className="help-launch" size="lg">
            <MessageCircle />
            Ask WorkPassport
          </Button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="help-overlay" />
          <Dialog.Content className="help-drawer">
            <div className="help-heading">
              <div>
                <span className="eyebrow">A LITTLE GUIDANCE, ALWAYS HERE</span>
                <Dialog.Title>Guided Help (demo)</Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" aria-label="Close help">
                  <X />
                </Button>
              </Dialog.Close>
            </div>
            <Dialog.Description className="help-intro">
              Hello! Let’s take the next step together. These answers come from a local guide, not
              AI. Do not share private information.
            </Dialog.Description>
            <div className="help-body">
              <p className="notice">{pageHint(path)}</p>
              <h3>What would you like to know?</h3>
              <div className="help-suggestions">
                {faq.map((f) => (
                  <Button
                    variant="outline"
                    key={f.question}
                    onClick={() => ask(f.question)}
                    disabled={busy}
                  >
                    {f.question}
                  </Button>
                ))}
              </div>
              <div role="log" aria-live="polite" className="help-messages">
                {messages.map((m, i) => (
                  <div key={i}>
                    <strong>{m.question}</strong>
                    <p>{m.answer}</p>
                  </div>
                ))}
              </div>
              <div ref={logEnd} />
              {error && <p role="alert">{error}</p>}
            </div>
            <form
              className="help-input"
              onSubmit={(e) => {
                e.preventDefault();
                ask(question);
              }}
            >
              <label className="sr-only" htmlFor="help-question">
                Ask a question
              </label>
              <input
                id="help-question"
                className="form-input"
                maxLength={400}
                placeholder="Ask about your next step…"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <Button
                type="submit"
                size="icon"
                disabled={busy || !question.trim()}
                aria-label="Send question"
              >
                <Send />
              </Button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </HelpContext.Provider>
  );
}
