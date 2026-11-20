import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, ArrowUpRight, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/features/workpassport/context";
import { goalOptions, goalLabel, type Activity } from "@/features/workpassport/types";
import { dashboardSections, matchReasons } from "@/features/workpassport/service";
import { workers } from "@/features/workpassport/data";
import { JobCard, WorkerCard, Empty, PageHeader, pageHead } from "@/features/workpassport/shared";
export const Route = createFileRoute("/dashboard")({
  head: () =>
    pageHead(
      "Your dashboard",
      "Your personalized WorkPassport workspace for opportunities, applications, services and hiring.",
    ),
  component: Dashboard,
});
function Dashboard() {
  const { state, ready, update } = useDemo();
  const [editing, setEditing] = useState(false);
  const [profileEdit, setProfileEdit] = useState(false);
  const [selected, setSelected] = useState<Activity[]>([]);
  const [skills, setSkills] = useState("");
  const [serviceTitle, setServiceTitle] = useState("");
  const [price, setPrice] = useState("");
  const a = state.account;
  if (!ready) return <main className="loading-state">Loading dashboard…</main>;
  if (!a)
    return (
      <main className="container page-main">
        <Empty title="Your next chapter is waiting">
          <p className="mb-5">Create a demo account to see your personalized dashboard.</p>
          <Button asChild>
            <Link to="/join">Get started</Link>
          </Button>
        </Empty>
      </main>
    );
  const sections = dashboardSections(a.activities);
  const recommended = state.jobs
    .map((j) => ({ j, reasons: matchReasons(j, a) }))
    .filter((x) => x.reasons.length > 0)
    .sort((x, y) => y.reasons.length - x.reasons.length)
    .slice(0, 3);
  const apps = state.applications.filter((x) => x.accountId === a.id);
  const myJobs = state.jobs.filter((x) => x.owner === a.id);
  const quotes = state.quotes.filter((x) => x.accountId === a.id);
  const services = state.services.filter((x) => x.accountId === a.id);
  return (
    <main className="container page-main">
      <PageHeader
        eyebrow="YOUR WORKPASSPORT"
        title={a.kind === "Business" ? `${a.name} workspace` : `Hello, ${a.name.split(" ")[0]}.`}
        description="A new connection could be the start of something great."
      >
        <Button
          variant="outline"
          onClick={() => {
            setSelected(a.activities);
            setEditing(!editing);
          }}
        >
          <Plus />
          Add activity
        </Button>
      </PageHeader>
      <div className="skill-tags mb-5">
        {a.activities.map((x) => (
          <span key={x}>{goalLabel(x, a.kind)}</span>
        ))}
      </div>
      {editing && (
        <form
          className="activity-editor"
          onSubmit={(e) => {
            e.preventDefault();
            if (!selected.length) {
              toast.error("Keep at least one activity");
              return;
            }
            if (
              update((s) => ({
                ...s,
                account: s.account ? { ...s.account, activities: selected } : null,
              }))
            ) {
              setEditing(false);
              toast.success("Your activities are updated");
            }
          }}
        >
          <h2>Your activities</h2>
          <div className="choice-grid">
            {goalOptions(a.kind).map(({ value: x, label }) => (
              <label key={x} className="choice-label">
                <input
                  type="checkbox"
                  checked={selected.includes(x)}
                  onChange={() =>
                    setSelected((p) => (p.includes(x) ? p.filter((v) => v !== x) : [...p, x]))
                  }
                />
                {label}
              </label>
            ))}
          </div>
          <Button type="submit" className="mt-4">
            <Save />
            Save activities
          </Button>
        </form>
      )}
      {a.kind === "Individual" && (
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>Your work profile</h2>
              <p>
                {a.location} · {a.kind} · Self-declared skills
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                setSkills(a.skills.join(", "));
                setProfileEdit(!profileEdit);
              }}
            >
              <Pencil />
              Edit skills
            </Button>
          </div>
          <div className="skill-tags">
            {a.skills.length ? (
              a.skills.map((s) => <span key={s}>{s}</span>)
            ) : (
              <span>No skills added yet</span>
            )}
          </div>
          {profileEdit && (
            <form
              className="filters mt-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  update((s) => ({
                    ...s,
                    account: s.account
                      ? {
                          ...s.account,
                          skills: skills
                            .split(",")
                            .map((v) => v.trim())
                            .filter(Boolean),
                        }
                      : null,
                  }))
                ) {
                  setProfileEdit(false);
                  toast.success("Skills updated");
                }
              }}
            >
              <input
                className="form-input"
                aria-label="Edit your skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Skills separated by commas"
              />
              <Button type="submit">Save skills</Button>
            </form>
          )}
          <Button asChild variant="link" className="mt-3 px-0">
            <Link to="/passport/$id" params={{ id: a.id }}>
              View my WorkPassport <ArrowUpRight />
            </Link>
          </Button>
        </section>
      )}
      {a.kind === "Business" && a.role === "owner" && (
        <section className="dashboard-section">
          <h2>Business administration</h2>
          <p className="hint">
            You created this business workspace and are its owner/admin in this demo. Frontend
            access is not security; staff delegation requires a future secure backend.
          </p>
          <div className="record-row">
            <span>
              {a.industry || "Industry not added"} · {a.location}
            </span>
            <span>{a.businessStatus ?? "informal"} — unverified</span>
          </div>
          <p className="hint">Contact person: {a.contactName || "Not added in this legacy demo"}</p>
          <Button disabled variant="outline" className="mt-4">
            Delegate staff roles — coming later
          </Button>
        </section>
      )}
      <div className="dashboard-discovery">
        {(sections.employment || sections.services) && (
          <Button asChild>
            <Link to="/opportunities">
              Browse opportunities <ArrowUpRight />
            </Link>
          </Button>
        )}
        {sections.hiring && (
          <Button asChild variant="outline">
            <Link to="/talent">
              Find talent <ArrowUpRight />
            </Link>
          </Button>
        )}
        <Button asChild variant="outline">
          <Link to="/trust">Trust & Verification</Link>
        </Button>
      </div>

      {(sections.employment || sections.services) && (
        <section className="dashboard-section">
          <h2>Recommended for you</h2>
          <p className="hint mb-5">
            Based on your skills and location. Previous ratings are never required.
          </p>
          {recommended.length ? (
            <div className="jobs-grid">
              {recommended.map(({ j, reasons }) => (
                <JobCard key={j.id} job={j} reasons={reasons} />
              ))}
            </div>
          ) : (
            <Empty title="Let’s find your connection">
              <p>Add your skills, or explore all opportunities.</p>
              <Button asChild variant="link">
                <Link to="/opportunities">Browse opportunities</Link>
              </Button>
            </Empty>
          )}
        </section>
      )}
      {sections.employment && (
        <section className="dashboard-section">
          <h2>Your applications</h2>
          {apps.length ? (
            apps.map((app) => {
              const job = state.jobs.find((j) => j.id === app.jobId);
              return (
                <div className="record-row" key={app.id}>
                  <div>
                    {job ? (
                      <Link
                        to="/opportunities/$id"
                        params={{ id: job.id }}
                        className="font-semibold"
                      >
                        {job.title}
                      </Link>
                    ) : (
                      "Unavailable opportunity"
                    )}
                    <small>{app.message}</small>
                  </div>
                  <span className="job-type">Demo application saved</span>
                </div>
              );
            })
          ) : (
            <Empty title="A fresh start">
              <p>Your demo applications will appear here.</p>
            </Empty>
          )}
        </section>
      )}
      {sections.services && (
        <section className="dashboard-section">
          <h2>{a.kind === "Business" ? "Your business services" : "Your freelance services"}</h2>
          {services.map((s) => (
            <div key={s.id} className="record-row">
              <strong>{s.title}</strong>
              <span>N$ {s.price}</span>
            </div>
          ))}
          {!services.length && <p className="hint mb-5">Add your first service offering.</p>}
          <form
            className="filters mt-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (
                update((s) => ({
                  ...s,
                  services: [
                    ...s.services,
                    { id: crypto.randomUUID(), accountId: a.id, title: serviceTitle, price },
                  ],
                }))
              ) {
                setServiceTitle("");
                setPrice("");
                toast.success("Demo service saved");
              }
            }}
          >
            <input
              className="field flex-1"
              required
              aria-label="Service title"
              placeholder="e.g. Logo design"
              value={serviceTitle}
              onChange={(e) => setServiceTitle(e.target.value)}
            />
            <input
              className="field"
              required
              type="number"
              min="1"
              aria-label="Service starting price"
              placeholder="Starting price (N$)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <Button type="submit">
              <Plus />
              Add service
            </Button>
          </form>
          <h2>Quotation activity</h2>
          <p className="hint">
            No incoming quotations yet. This demo does not connect accounts or contact clients.
          </p>
        </section>
      )}
      {sections.hiring && (
        <>
          <section className="dashboard-section">
            <div className="section-heading">
              <h2>Your job postings</h2>
              <Button asChild>
                <Link to="/post-job">
                  <Plus />
                  Post opportunity
                </Link>
              </Button>
            </div>
            {myJobs.length ? (
              <div className="jobs-grid">
                {myJobs.map((j) => (
                  <JobCard key={j.id} job={j} />
                ))}
              </div>
            ) : (
              <Empty title="Your next team member starts here">
                <p>Create a demo opportunity to begin.</p>
              </Empty>
            )}
            <h2>Recruitment activity</h2>
            {state.applications.filter((app) => myJobs.some((j) => j.id === app.jobId)).length ? (
              state.applications
                .filter((app) => myJobs.some((j) => j.id === app.jobId))
                .map((app) => (
                  <div key={app.id} className="record-row">
                    <span>
                      {state.jobs.find((j) => j.id === app.jobId)?.title}
                      <small>{app.message}</small>
                    </span>
                    <span className="job-type">Demo application</span>
                  </div>
                ))
            ) : (
              <p className="hint">No applications to your postings yet.</p>
            )}
          </section>
          <section className="dashboard-section">
            <h2>Potential workers</h2>
            <div className="talent-grid">
              {workers.slice(0, 2).map((w) => (
                <WorkerCard worker={w} key={w.id} />
              ))}
            </div>
          </section>
        </>
      )}
      {(sections.hiring || sections.services) && (
        <section className="dashboard-section">
          <h2>Your quotation requests</h2>
          {quotes.length ? (
            quotes.map((q) => (
              <div key={q.id} className="record-row">
                <div>
                  <strong>{workers.find((w) => w.id === q.workerId)?.name || "Demo worker"}</strong>
                  <small>{q.description}</small>
                </div>
                <span>
                  N$ {q.budget}
                  <small>Saved locally · Not sent</small>
                </span>
              </div>
            ))
          ) : (
            <Empty title="No quotation requests yet">
              <Button asChild variant="link">
                <Link to="/talent">Find someone for your project</Link>
              </Button>
            </Empty>
          )}
        </section>
      )}
      <p className="hint mt-8">
        Demo workspace · All changes stay on this browser. No real applications, messages or
        payments.
      </p>
    </main>
  );
}
