import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/features/workpassport/context";
import { PageHeader, pageHead, Empty } from "@/features/workpassport/shared";
import { trustStatus } from "@/features/workpassport/service";
export const Route = createFileRoute("/trust")({
  head: () =>
    pageHead(
      "Trust & Verification",
      "Understand self-declared skills, identity checks and future secure verification. No documents are collected in this demo.",
    ),
  component: Trust,
});
function Trust() {
  const { state, ready } = useDemo();
  const a = state.account;
  if (!ready) return <main className="loading-state">Loading trust information…</main>;
  if (!a)
    return (
      <main className="container page-main">
        <Empty title="Resume or create your demo profile">
          <Button asChild>
            <Link to="/login">Continue</Link>
          </Button>
        </Empty>
      </main>
    );
  const checks =
    a.kind === "Business"
      ? [
          "Trading name and business details",
          ...(a.businessStatus === "registered" ? ["Registration record for the trading name"] : []),
          "Permission for the contact person to represent the business",
          "Business contact checks",
        ]
      : [
          "Identity / contact checks",
          "Self-declared skills — unverified",
          "Confirmed work evidence — future review",
          "References — unverified until checked",
          "Police clearance certificate (certificate of good conduct), if relevant to the role",
        ];
  return (
    <main className="container page-main">
      <PageHeader
        title="Trust & Verification"
        description="See which details a reviewer would check and what each check means."
      />
      <div className="notice">
        <Shield className="inline mr-2" size={18} />
        No evidence has been submitted. Document checks will open when secure review is available.
      </div>
      {a.kind === "Business" && (
        <p className="mb-5">
          {a.name} is a self-declared {a.businessStatus ?? "informal"} business — unverified.
          Informal businesses do not need a registration number to join.
        </p>
      )}
      <div className="detail-layout">
        <section>
          <h2 className="text-xl font-bold mb-4">Your checklist</h2>
          {checks.map((c) => (
            <div className="record-row" key={c}>
              <span>{c}</span>
              <span className="job-type">{trustStatus()}</span>
            </div>
          ))}
          <Button disabled className="mt-6">
            <LockKeyhole />
            Submit documents — coming later
          </Button>
          <p className="hint">
            Do not enter or store IDs, police clearances, certificates, bank details or documents
            here.
          </p>
        </section>
        <aside className="detail-sidebar">
          <h3>How a future review works</h3>
          <ol className="trust-process">
            <li>Not submitted: no evidence has been received.</li>
            <li>Awaiting review: securely submitted evidence is being checked. Not verified.</li>
            <li>
              Verified: only a future authoritative review can award a specific check. No client
              action can award it.
            </li>
          </ol>
          <p className="hint">
            In WorkPassport, a police clearance check would apply only where relevant to a particular role. A certificate alone cannot tell you whether someone is trustworthy or skilled.
            A verified identity would not automatically verify skills or eligibility.
          </p>
          <p className="hint">
            Business owner/admin access here is a demonstration. Real permissions, staff delegation
            and audit history require secure server checks.
          </p>
        </aside>
      </div>
      <Button asChild variant="link" className="mt-8">
        <Link to="/dashboard">Back to dashboard</Link>
      </Button>
    </main>
  );
}
