import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/features/workpassport/context";
import { PageHeader, pageHead } from "@/features/workpassport/shared";
export const Route = createFileRoute("/login")({
  head: () =>
    pageHead(
      "Resume your demo",
      "Resume a saved WorkPassport demo on this device. No password or secure authentication.",
    ),
  component: Login,
});
function Login() {
  const { state, ready, update } = useDemo();
  const navigate = useNavigate();
  const [selected, setSelected] = useState("");
  const profiles = state.profiles ?? [];
  const saved = profiles.find(a => a.id === selected) ?? state.savedAccount ?? state.account;
  return (
    <main className="container page-main">
      <div className="form-panel">
        <PageHeader
          title="Welcome back"
          description="This is a device-only demo, not secure sign-in. No password is needed."
        />
        {!ready ? (
          <p>Checking this device…</p>
        ) : saved ? (
          <>
            {profiles.length > 1 && (
              <label className="form-group">Choose a demo profile on this device
                <select className="form-input" value={saved.id} onChange={e => setSelected(e.target.value)}>
                  {profiles.map(a => <option key={a.id} value={a.id}>{a.name} · {a.kind}</option>)}
                </select>
              </label>
            )}
            <div className="notice">
              Saved demo: {saved.name} · {saved.kind}. Anyone using this browser can resume it.
            </div>
            <Button
              size="lg"
              onClick={() => {
                if (update((s) => ({ ...s, account: saved }))) navigate({ to: "/dashboard" });
              }}
            >
              Resume saved demo on this device
            </Button>
            <p className="hint mt-5">
              <Link to="/join" className="underline">
                Create a different demo profile
              </Link>
            </p>
          </>
        ) : (
          <>
            <p className="mb-5">No saved demo profile was found on this device.</p>
            <Button asChild size="lg">
              <Link to="/join">Create demo profile</Link>
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
