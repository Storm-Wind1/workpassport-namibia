import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { UserRound, Building2, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/features/workpassport/context";
import { pageHead } from "@/features/workpassport/shared";
import { goalOptions, goalLabel, locations, categories } from "@/features/workpassport/types";
import {
  createDemoProfile,
  registrationError,
  type Registration,
} from "@/features/workpassport/onboarding";
import { useHelp } from "@/features/workpassport/help";
export const Route = createFileRoute("/join")({
  head: () =>
    pageHead(
      "Create your demo profile",
      "Four simple steps for individuals and businesses. Informal businesses welcome; verification is not live.",
    ),
  component: Join,
});
function Join() {
  const { state, update } = useDemo();
  const navigate = useNavigate();
  const openHelp = useHelp();
  const drafts = useRef<Partial<Record<Registration["kind"], Registration>>>({});
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const [d, setD] = useState<Registration>({
    kind: "Individual",
    name: "",
    email: "",
    location: "",
    skills: "",
    phone: "",
    industry: "",
    contactName: "",
    businessStatus: "informal",
    registrationNumber: "",
    activities: [],
    consent: false,
  });
  useEffect(() => {
    heading.current?.focus();
  }, [step]);
  const change = (key: keyof Registration, value: unknown) =>
    setD((prev) => ({ ...prev, [key]: value }));
  function chooseKind(kind: Registration["kind"]) {
    drafts.current[d.kind] = d;
    setD(drafts.current[kind] ?? {
      kind, name: "", email: "", location: "", skills: "", phone: "",
      industry: "", contactName: "", businessStatus: "informal", registrationNumber: "",
      activities: [], consent: false,
    });
    setError("");
  }
  const business = d.kind === "Business";
  const instructions = [
    "Choose Individual for yourself, or Business to represent a business. Then select Next.",
    business ? "Use a made-up trading name and the name of the person who runs the business. Informal businesses can join too." : "Use a made-up name, email and town. You can leave skills blank and add them later.",
    business ? "Choose the work your business wants to do. You already manage its workspace as the owner." : "Choose what you want to do first. You can look for work, offer a service, or hire help.",
    "Check the details below. Use Back to change anything before creating your demo profile.",
  ];
  function advance() {
    const err = registrationError(step, d);
    setError(err ?? "");
    if (err) return;
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    const account = createDemoProfile(d, crypto.randomUUID());
    if (update((s) => ({ ...s, account, savedAccount: account }))) navigate({ to: "/dashboard" });
  }
  function field(
    label: string,
    key: "name" | "email" | "phone" | "skills" | "contactName" | "registrationNumber",
    required = false,
    type = "text",
  ) {
    return (
      <div className="form-group">
        <label className="form-label" htmlFor={key}>
          {label}
        </label>
        <input
          id={key}
          className="form-input"
          type={type}
          required={required}
          minLength={required && type !== "email" ? 2 : undefined}
          value={d[key]}
          onChange={(e) => change(key, e.target.value)}
        />
      </div>
    );
  }
  return (
    <main className="container page-main">
      <div className="form-panel wizard">
        <span className="eyebrow">ONE PASSPORT. MANY POSSIBILITIES.</span>
        <div className="wizard-progress">
          <span>Step {step} of 4</span>
          <span>{["Your profile", "Demo details", "Your goals", "Review"][step - 1]}</span>
        </div>
        <progress max={4} value={step} aria-label="Registration progress" />
        <h1 ref={heading} tabIndex={-1}>
          {
            [
              "How are you joining?",
              business ? "Tell us about your business" : "Tell us about yourself",
              business ? "What does your business want to do?" : "What would you like to do?",
              business ? "Review your business profile" : "Review your individual profile",
            ][step - 1]
          }
        </h1>
        <p>{instructions[step - 1]}</p>
        <Button type="button" variant="link" className="px-0" onClick={() => openHelp(instructions[step - 1])}>
          Help with this step
        </Button>
        {state.account && step === 1 && (
          <div className="notice">
            You already have a demo profile.{" "}
            <Link to="/dashboard" className="underline">
              Add activities in your dashboard
            </Link>{" "}
            without another account. Creating a new profile switches your workspace; previous demo
            records remain saved.
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            advance();
          }}
        >
          {step === 1 && (
            <div className="choice-grid">
              {(["Individual", "Business"] as const).map((kind) => (
                <label className="choice-label profile-choice" key={kind}>
                  <input
                    type="radio"
                    name="kind"
                    aria-label={kind}
                    checked={d.kind === kind}
                    onChange={() => chooseKind(kind)}
                  />
                  {kind === "Individual" ? <UserRound size={28} /> : <Building2 size={28} />}
                  <span>
                    <strong>{kind}</strong>
                    <small>
                      {kind === "Individual"
                        ? "Find work, offer your skills, or hire a helping hand."
                        : "Recruit people or offer services as a small business. Informal businesses welcome."}
                    </small>
                  </span>
                </label>
              ))}
            </div>
          )}
          {step === 2 && (
            <>
              {field(d.kind === "Business" ? "Business / trading name" : "Full name", "name", true)}
              {d.kind === "Business" && (
                <>
                  <div className="form-group">
                    <label htmlFor="industry" className="form-label">
                      Industry / category
                    </label>
                    <select
                      id="industry"
                      className="form-input"
                      required
                      value={d.industry}
                      onChange={(e) => change("industry", e.target.value)}
                    >
                      <option value="">Choose an industry</option>
                      {[...categories, "Other"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  {field("Contact person’s name", "contactName", true)}
                  <fieldset className="form-group">
                    <legend className="form-label">
                      Business status — self-declared, unverified
                    </legend>
                    <div className="choice-grid">
                      {(["informal", "registered"] as const).map((status) => (
                        <label key={status} className="choice-label">
                          <input
                            type="radio"
                            name="status"
                            checked={d.businessStatus === status}
                            onChange={() => change("businessStatus", status)}
                          />
                          {status === "informal" ? "Informal business" : "Registered business"}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {d.businessStatus === "registered" && (
                    <>
                      {field("Registration number (optional demo text only)", "registrationNumber")}
                      <p className="hint">
                        Use a made-up example or leave this blank. A reviewer would need to check registration separately.
                      </p>
                    </>
                  )}
                  <div className="notice">
                    You are the owner/admin of this demo business workspace. Staff roles can be
                    delegated only in a future secure version.
                  </div>
                </>
              )}
              {field(d.kind === "Business" ? "Business email" : "Email", "email", true, "email")}
              <div className="form-group">
                <label htmlFor="town" className="form-label">
                  {d.kind === "Business" ? "City / town" : "Town"}
                </label>
                <select
                  id="town"
                  className="form-input"
                  value={d.location}
                  onChange={(e) => change("location", e.target.value)}
                >
                  <option value="">Choose your town</option>
                  {locations.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
              {d.kind === "Individual" && (
                <>
                  
                  {field("Simple skills (optional, separated by commas)", "skills")}
                  <p className="hint">
                    Skills are self-declared, not verified. No experience or ratings needed to
                    begin.
                  </p>
                </>
              )}
            </>
          )}
          {step === 3 && (
            <>
              <p className="mb-5 text-muted-foreground">
                Pick at least one. You can change these choices later on your dashboard.
              </p>
              <div className="choice-grid">
                {goalOptions(d.kind).map((g) => (
                  <label key={g.value} className="choice-label">
                    <input
                      type="checkbox"
                      checked={d.activities.includes(g.value)}
                      onChange={() =>
                        change(
                          "activities",
                          d.activities.includes(g.value)
                            ? d.activities.filter((x) => x !== g.value)
                            : [...d.activities, g.value],
                        )
                      }
                    />
                    {g.label}
                  </label>
                ))}
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <dl className="review-list">
                {[
                  ["Profile", d.kind],
                  ["Name", d.name],
                  ["Email", d.email],
                  ["Town", d.location],
                  ["Goals", d.activities.map((a) => goalLabel(a, d.kind)).join(", ")],
                  ...(d.kind === "Business"
                    ? [
                        ["Industry", d.industry],
                        ["Contact person", d.contactName],
                        ["Business status", `${d.businessStatus} — unverified`],
                        ["Workspace role", "Owner/admin (demo)"],
                      ]
                    : [["Skills", d.skills || "Not added"]]),
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="notice">
                Review status: Not submitted. Your identity,{" "}
                {d.kind === "Business"
                  ? "business details and representative"
                  : "skills, experience and references"}{" "}
                have not been checked. Secure verification is coming later.
              </div>
              <label className="choice-label">
                <input
                  type="checkbox"
                  checked={d.consent}
                  onChange={(e) => change("consent", e.target.checked)}
                />
                I will use demo data only. I understand this is not secure sign-in and nothing is
                sent to employers.
              </label>
            </>
          )}
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <div className="wizard-actions">
            <Button
              type="button"
              variant="outline"
              disabled={step === 1}
              onClick={() => {
                setStep(step - 1);
                setError("");
              }}
            >
              <ArrowLeft />
              Back
            </Button>
            <Button type="submit">
              {step === 4 ? "Create demo profile" : "Next"}
              <ArrowRight />
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
