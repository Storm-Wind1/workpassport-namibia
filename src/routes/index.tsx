import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  MapPin,
  BadgeCheck,
  Users,
  HeartHandshake,
  Globe2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import workersPhoto from "@/assets/workers.jpg";
import { useDemo } from "@/features/workpassport/context";
import { JobCard, categoryIcons, pageHead } from "@/features/workpassport/shared";
import { categories, locations } from "@/features/workpassport/types";
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
                {state.account ? "Go to dashboard" : "Get started"}
                <ArrowRight />
              </Link>
            </Button>
            <Link to="/how-it-works" className="hero-learn">
              How it works <ArrowUpRight size={16} />
            </Link>
          </div>
          <p className="hero-demo-note">Explore a demo. No live hiring or verified credentials.</p>
        </div>
        <div className="hero-note">
          <BadgeCheck size={27} />
          <div>
            <strong>Big potential. Local beginnings.</strong>Every skill deserves an opportunity.
          </div>
        </div>
      </section>
      <section className="trust-band">
        <div className="container trust-inner">
          <div>
            <Users size={20} />
            <span>
              <strong>For every kind of worker</strong>
              <br />
              From first jobs to skilled professionals
            </span>
          </div>
          <div>
            <MapPin size={20} />
            <span>
              <strong>Namibian opportunities</strong>
              <br />
              Local work. Real possibilities.
            </span>
          </div>
          <div>
            <HeartHandshake size={22} />
            <span>
              <strong>Built on connection</strong>
              <br />
              People first. Always.
            </span>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THERE’S A PLACE FOR YOUR SKILLS</span>
              <h2>What kind of work moves you?</h2>
            </div>
            <Link to="/how-it-works">
              Learn more <ArrowRight size={15} />
            </Link>
          </div>
          <div className="categories-grid">
            {categories.map((c, i) => {
              const Icon = categoryIcons[i] ?? Sparkles;
              return (
                <div key={c} className="category-tile">
                  <Icon size={27} />
                  {c}
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="section section-tinted">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">MORE THAN A CV</span>
              <h2>Your work story, in one place</h2>
              <p>
                Make practical skills visible, whether you learned in a classroom, a workshop or on
                the job.
              </p>
            </div>
          </div>
          <div className="steps-grid">
            <div>
              <h3>For your next opportunity</h3>
              <p>
                Jobseekers and informal tradespeople can show self-declared skills and describe
                their experience. No previous ratings needed.
              </p>
            </div>
            <div>
              <h3>For independent work</h3>
              <p>
                Digital freelancers and service providers can describe their work and prepare demo
                quotations. Your goals can grow with you.
              </p>
            </div>
            <div>
              <h3>For a growing business</h3>
              <p>
                Small and informal businesses can introduce their services and explore hiring help,
                without pretending to hold verified credentials.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">A WELCOMING, HONEST START</span>
              <h2>Everyone has something to offer</h2>
            </div>
          </div>
          <div className="steps-grid">
            <div>
              <h3>Start where you are</h3>
              <p>
                Short steps, clear choices and guided help. No formal experience is required to make
                a demo profile. Ask a trusted person for help if you need it.
              </p>
            </div>
            <div>
              <h3>A passport you can share</h3>
              <p>
                A digital profile brings skills, work examples and references together. Seeded demo
                passports can be shared; your personal demo stays on this device.
              </p>
            </div>
            <div>
              <h3>Trust without shortcuts</h3>
              <p>
                Self-declared does not mean verified. Identity and evidence checks are not live. No
                sensitive documents are collected, and no client click awards verification.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">A SIMPLE START. A BRIGHTER FUTURE.</span>
              <h2>Make your next move</h2>
            </div>
            <Link to="/how-it-works">
              How it works <ArrowRight size={15} />
            </Link>
          </div>
          <div className="steps-grid">
            {[
              [
                "Create your WorkPassport",
                "Bring your skills, experience and ambitions together in one profile. You have more to offer than a CV.",
              ],
              [
                "Find your connection",
                "Discover opportunities that fit your skills, or meet the people who can help your business grow.",
              ],
              [
                "Take the next step",
                "Apply for work, start a conversation, or request a quote. Your next chapter starts with you.",
              ],
            ].map(([title, text], i) => (
              <div key={title}>
                <span className="step-number">0{i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="cta-band">
        <div className="container cta-inner">
          <div>
            <h2>A little courage. A world of possibility.</h2>
            <p>Whatever your skill, wherever you’re starting — you belong here.</p>
          </div>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/join">
              Get started today <Sparkles />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
