import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { demoRepository, initialState } from "./service";
import type { DemoState } from "./types";
interface Context {
  state: DemoState;
  ready: boolean;
  update: (fn: (s: DemoState) => DemoState) => boolean;
}
const DemoContext = createContext<Context | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      setState(demoRepository.load());
    } catch {
      toast.error("Saved demo data could not be loaded. A fresh demo is ready.");
    }
    setReady(true);
  }, []);
  function update(fn: (s: DemoState) => DemoState) {
    const changed = fn(state);
    const next = {
      ...changed,
      savedAccount: changed.account ?? changed.savedAccount ?? state.savedAccount ?? state.account,
    };
    try {
      demoRepository.save(next);
      setState(next);
      return true;
    } catch {
      toast.error("Your browser could not save this change. Check available device storage.");
      return false;
    }
  }
  return <DemoContext.Provider value={{ state, ready, update }}>{children}</DemoContext.Provider>;
}
export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("DemoProvider is required");
  return value;
}
