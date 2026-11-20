import { Link } from "@tanstack/react-router";
import { Menu, X, ArrowUpRight, Heart, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brand } from "./shared";
import { useDemo } from "./context";
import { dashboardSections } from "./service";
export function Header() {
  const [open, setOpen] = useState(false);
  const { state, update } = useDemo();
  const a = state.account;
  const sections = dashboardSections(a?.activities ?? []);
  return (
    <>
      <div className="demo-strip">
        <span className="demo-dot" />A world of opportunity. Rooted in Namibia.
        <span className="demo-label">DEMO EXPERIENCE</span>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav
            className={open ? "main-nav is-open" : "main-nav"}
            aria-label="Main navigation"
            onClick={() => setOpen(false)}
          >
            {a ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                {(sections.employment || sections.services) && (
                  <Link to="/opportunities">Find work</Link>
                )}
                {sections.hiring && <Link to="/talent">Find talent</Link>}
                <Link to="/trust">Trust & Verification</Link>
              </>
            ) : (
              <>
                <Link to="/how-it-works">How it works</Link>
                <Link to="/help">Help</Link>
                <Link to="/login" className="mobile-login">
                  Log in
                </Link>
              </>
            )}
          </nav>
          <div className="header-actions">
            {a ? (
              <Button
                variant="ghost"
                size="icon"
                className="session-signout"
                aria-label="Sign out of demo"
                title="Sign out of demo"
                onClick={() => update((s) => ({ ...s, account: null }))}
              >
                <LogOut />
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="login-link">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link to="/join">
                    Sign up
                    <ArrowUpRight />
                  </Link>
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu"
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
export function Footer() {
  const { state } = useDemo();
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div>
          <Brand />
          <p>Your Skills. Your Opportunities. Your Future.</p>
          <span className="footer-made">
            Made for Namibia, with
            <Heart size={13} />
          </span>
        </div>
        <div>
          <h4>Learn about WorkPassport</h4>
          <Link to="/how-it-works">How it works</Link>
          <Link to="/help">Help & guidance</Link>
          {state.account && <Link to="/trust">Trust & Verification</Link>}
        </div>
        <div>
          <h4>Your next chapter</h4>
          <Link to="/join">Create a demo profile</Link>
          <Link to="/login">Resume your demo</Link>
          {state.account && <Link to="/dashboard">Your dashboard</Link>}
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 WorkPassport Namibia</span>
        <span>Demo only · No real applications, payments or verified credentials</span>
      </div>
    </footer>
  );
}
