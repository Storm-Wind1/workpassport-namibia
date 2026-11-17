import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/features/workpassport/context";
import { categories, locations, jobTypes } from "@/features/workpassport/types";
import { PageHeader, pageHead, Empty } from "@/features/workpassport/shared";
export const Route = createFileRoute("/post-job")({
  head: () =>
    pageHead(
      "Post an opportunity",
      "Create a local demo listing for a job, gig, freelance project or skilled labour opportunity.",
    ),
  component: PostJob,
});
function PostJob() {
  const { state, update } = useDemo();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState(
    state.account?.kind === "Business" ? state.account.name : "",
  );
  const [location, setLocation] = useState("Windhoek");
  const [category, setCategory] = useState("IT");
  const [type, setType] = useState("Permanent");
  const [pay, setPay] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const account = state.account;
  if (!account)
    return (
      <main className="container page-main">
        <Empty title="Start with a demo account">
          <Button asChild>
            <Link to="/join">Create account</Link>
          </Button>
        </Empty>
      </main>
    );
  return (
    <main className="container page-main">
      <div className="form-panel">
        <PageHeader
          title="Make room for local talent"
          description="Create a demo opportunity. Nothing is published outside this device."
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const id = crypto.randomUUID();
            if (
              update((s) => ({
                ...s,
                jobs: [
                  {
                    id,
                    title,
                    company,
                    location,
                    category,
                    type,
                    pay: `N$ ${pay}`,
                    description,
                    skills: skills
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                    owner: account.id,
                  },
                  ...s.jobs,
                ],
                account: s.account
                  ? {
                      ...s.account,
                      activities: s.account.activities.includes("Hire workers")
                        ? s.account.activities
                        : [...s.account.activities, "Hire workers"],
                    }
                  : null,
              }))
            ) {
              toast.success("Demo opportunity created");
              navigate({ to: "/opportunities/$id", params: { id } });
            }
          }}
        >
          {[
            ["Job title", title, setTitle, "title"],
            ["Business or employer", company, setCompany, "company"],
          ].map(([label, value, setter, id]) => (
            <div className="form-group" key={String(id)}>
              <label className="form-label" htmlFor={String(id)}>
                {String(label)}
              </label>
              <input
                className="form-input"
                id={String(id)}
                required
                minLength={2}
                value={String(value)}
                onChange={(e) => (setter as (v: string) => void)(e.target.value)}
              />
            </div>
          ))}
          <div className="form-row">
            {[
              { label: "Location", value: location, set: setLocation, options: locations },
              { label: "Category", value: category, set: setCategory, options: categories },
              { label: "Work type", value: type, set: setType, options: jobTypes },
            ].map((f) => (
              <div className="form-group" key={f.label}>
                <label className="form-label" htmlFor={f.label}>
                  {f.label}
                </label>
                <select
                  id={f.label}
                  className="form-input"
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                >
                  {f.options.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
            ))}
            <div className="form-group">
              <label htmlFor="pay" className="form-label">
                Pay in N$ (include period)
              </label>
              <input
                id="pay"
                className="form-input"
                required
                value={pay}
                onChange={(e) => setPay(e.target.value)}
                placeholder="e.g. 450 / day"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              About the work
            </label>
            <textarea
              id="description"
              className="form-input"
              rows={5}
              required
              minLength={20}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="job-skills" className="form-label">
              Skills (separated by commas)
            </label>
            <input
              id="job-skills"
              className="form-input"
              required
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>
          <Button className="w-full" type="submit">
            Create demo opportunity
          </Button>
        </form>
      </div>
    </main>
  );
}
