import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import workersPhoto from "@/assets/workers.jpg";
import { useDemo } from "@/features/workpassport/context";
import { pageHead } from "@/features/workpassport/shared";
import { useHelp } from "@/features/workpassport/help";
export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Your next opportunity starts here",
      "Find employment, freelance projects and skilled workers across Namibia. Your Skills. Your Opportunities. Your Future.",
    ),
  component: Home,
});
function Home() {
  const { state } = useDemo();
  const openHelp = useHelp();

  return (
    <main>
      <section className="hero">
        <img
          className="hero-photo"
          src={workersPhoto}
          alt="Namibian professionals and a carpenter working together in a sunny workshop"
          width={1536}
          height={1024}
        />
        <div className="container hero-content">
          <div className="hero-eyebrow">
            <Globe2 size={13} /> LOCAL TALENT. LIMITLESS POTENTIAL.
          </div>
          <p className="hero-brand">WorkPassport Namibia</p>
          <h1>
            Your skills.
            <br />
            Your opportunities.
            <br />
            <em>Your future.</em>
          </h1>
          <p className="hero-description">
            One portable profile for your skills and experience. A starting point for Namibian
            jobseekers, tradespeople, digital freelancers and small businesses.
          </p>
          <div className="hero-actions">
            <Button variant="secondary" size="lg" asChild>
              <Link to={state.account ? "/dashboard" : "/join"}>
                {state.account ? "Go to dashboard" : "Sign up"}
                <ArrowRight />
              </Link>
            </Button>
            <Link to={state.account ? "/how-it-works" : "/login"} className="hero-learn">
              {state.account ? "How it works" : "Log in"} <ArrowUpRight size={16} />
            </Link>
          </div>
          <p className="hero-demo-note">Explore a demo. No live hiring or verified credentials.</p>
        </div>
      </section>
      <section className="section section-tinted" aria-labelledby="about-passport">
        <div className="container">
          <div className="section-heading">
            <div>
              <h2 id="about-passport">What is a WorkPassport?</h2>
              <p>It’s a work profile where you can tell people what you do and show what you’ve worked on.</p>
            </div>
          </div>
          <div className="steps-grid">
            <div><h3>Experience comes in many forms</h3><p>Built a gate, designed a poster or helped in a family shop? Those are examples you can put on your profile.</p></div>
            <div><h3>A place for small businesses</h3><p>A one-person workshop or a growing company can introduce its business and the people it needs.</p></div>
            <div><h3>Help from the first step</h3><p>You can ask a question before you sign up. The guide is still there when you fill in your profile.</p>
              <Button variant="link" className="px-0" onClick={() => openHelp()}>Ask WorkPassport <ArrowRight /></Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
