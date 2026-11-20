import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Send, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/features/workpassport/context";
import { PageHeader, Empty, pageHead } from "@/features/workpassport/shared";
import { matchReasons } from "@/features/workpassport/service";
export const Route = createFileRoute("/opportunities_/$id")({
  head: () =>
    pageHead(
      "Opportunity details",
      "Explore a Namibian demo opportunity, review required skills and submit your application.",
    ),
  component: JobDetail,
});
function JobDetail() {
  const { id } = Route.useParams();
  const { state, ready, update } = useDemo();
  const [message, setMessage] = useState("");
  const job = state.jobs.find((j) => j.id === id);
  if (!ready) return <main className="loading-state">Loading opportunity…</main>;
  if (!job)
    return (
      <main className="container page-main">
        <Empty title="This opportunity is unavailable">
          <Button asChild>
            <Link to="/opportunities">Browse opportunities</Link>
          </Button>
        </Empty>
      </main>
    );
  const account = state.account;
  const applied = state.applications.some((a) => a.accountId === account?.id && a.jobId === id);
  const reasons = account ? matchReasons(job, account) : [];
  return (
    <main className="container page-main">
      <Link to="/opportunities" className="back-link">
        <ArrowLeft size={15} />
        All opportunities
      </Link>
      <PageHeader
        title={job.title}
        eyebrow={job.company}
        description={`${job.location}, Namibia · ${job.type}`}
      />
      <div className="detail-layout">
        <div className="detail-main">
          <span className="job-type">{job.category}</span>
          <h2>About the opportunity</h2>
          <p>{job.description}</p>
          <h2>{job.requireAllSkills ? "Required skills for matching" : "Skills that help"}</h2>
          <div className="skill-tags">
            {job.skills.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          <h2>A fair starting point</h2>
          <p>
            Your practical skills and willingness to learn matter. A lack of previous ratings does
            not affect your matches.
          </p>
          {reasons.length > 0 && (
            <div className="notice">Why this matches you: {reasons.join(" · ")}</div>
          )}
          <div className="notice">
            Demo opportunity. Applications are saved on this device and are not sent to an employer.
          </div>
        </div>
        <aside className="detail-sidebar">
          <h3>{job.pay}</h3>
          <p className="location">
            <MapPin size={14} />
            {job.location}
          </p>
          {!account ? (
            <>
              <p className="hint mb-4">Create a demo account to apply.</p>
              <Button asChild>
                <Link to="/join">Get started</Link>
              </Button>
            </>
          ) : applied ? (
            <div className="notice">Application saved. View it in your dashboard.</div>
          ) : account.id === job.owner ? (
            <div className="notice">You posted this opportunity.</div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  update((s) => ({
                    ...s,
                    applications: [
                      ...s.applications,
                      { id: crypto.randomUUID(), jobId: id, accountId: account.id, message },
                    ],
                  }))
                )
                  toast.success("Demo application saved");
              }}
            >
              <label className="form-label" htmlFor="application">
                Tell us about yourself
              </label>
              <textarea
                id="application"
                className="form-input"
                required
                minLength={10}
                rows={5}
                placeholder="Your relevant skills, availability and interest…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button className="mt-4 w-full" type="submit">
                <Send />
                Submit demo application
              </Button>
              <p className="hint">Local demo only. No employer is contacted.</p>
            </form>
          )}
        </aside>
      </div>
    </main>
  );
}
