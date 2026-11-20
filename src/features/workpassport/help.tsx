import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { faq, localAssistant, pageHint } from "./assistant";
const HelpContext = createContext<((hint?: string) => void) | null>(null);
export function useHelp() {
  const open = useContext(HelpContext);
  return open ?? (() => {});
}
export function HelpProvider({ children }: { children: ReactNode }) {
  const opener = useRef<HTMLElement | null>(null);
  const [hint, setHint] = useState("");
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ question: string; answer: string; ai: boolean }[]>([]);
  const logEnd = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logEnd.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const path = useRouterState({ select: (s) => s.location.pathname });
  const topics = path === "/join" ? ["Which profile", "How do I register", "What does verified"]
    : path === "/login" ? ["How do I log", "Which profile"]
    : path === "/" ? ["What is WorkPassport", "Which profile", "How do I log"]
    : path === "/trust" ? ["What does verified", "How do I register"]
    : ["How do I change", "How do I find", "How do I hire", "How do quotes"];
  const suggestions = faq.filter((entry) => topics.some((topic) => entry.question.startsWith(topic)));
  async function ask(q: string) {
    if (!q.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const reply = await localAssistant.ask({ question: q, path });
      setMessages((m) => [...m, { question: q, answer: reply.answer, ai: reply.source === "on-device-ai" }]);
      setQuestion("");
    } catch {
      setError("Help could not answer. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <HelpContext.Provider value={(guidance = "") => { opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setHint(guidance); setOpen(true); }}>
      {children}
      <Dialog.Root open={open} onOpenChange={(next) => { setHint(""); setOpen(next); }}>
        <Dialog.Trigger asChild>
          <Button className="help-launch" size="lg">
            <MessageCircle />
            Ask WorkPassport
          </Button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="help-overlay" />
          <Dialog.Content className="help-drawer" onCloseAutoFocus={(event) => {
            if (opener.current?.isConnected) { event.preventDefault(); opener.current.focus(); }
            opener.current = null;
          }}>
            <div className="help-heading">
              <div>
                <Dialog.Title>Ask WorkPassport</Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" aria-label="Close help">
                  <X />
                </Button>
              </Dialog.Close>
            </div>
            <Dialog.Description className="help-intro">
              Ask in your own words or choose a question below. This guide works on your device. Please leave out private details.
            </Dialog.Description>
            <div className="help-body">
              <p className="notice">{hint || pageHint(path)}</p>
              <h3>What would you like to know?</h3>
              <div className="help-suggestions">
                {suggestions.map((f) => (
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
                    {m.ai && <small>Guide answer found with on-device AI</small>}
                  </div>
                ))}
              </div>
              {busy && <p role="status">Finding an answer…</p>}
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
