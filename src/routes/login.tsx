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
  const saved = state.savedAccount ?? state.account;
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
