import { describe, it, expect } from "vitest";
import { createDemoProfile, registrationError, type Registration } from "./onboarding";
import { goalOptions, type Account, type DemoState } from "./types";
import {
  migrateDemoState,
  initialState,
  trustStatus,
  dashboardSections,
  demoRepository,
} from "./service";
import { localAssistant, faq } from "./assistant";
const individual: Registration = {
  kind: "Individual",
  name: "Demo Person",
  email: "demo@example.com",
  location: "Windhoek",
  skills: "React, TypeScript",
  phone: "DEMO-NOT-SAVED",
  industry: "",
  contactName: "",
  businessStatus: "informal",
  registrationNumber: "",
  activities: ["Find employment"],
  consent: true,
};
const business: Registration = {
  ...individual,
  kind: "Business",
  name: "Demo Trading",
  industry: "Carpentry",
  contactName: "Demo Owner",
  activities: ["Offer freelance services"],
  consent: true,
};
describe("Guided registration", () => {
  it("requires valid name and email before continuing", () => {
    expect(registrationError(2, { ...individual, email: "invalid" })).toBe(
      "Enter a valid demo email address.",
    );
    expect(registrationError(2, { ...individual, name: " " })).toBe("Enter your full name.");
  });
  it("requires business industry and representative", () => {
    expect(registrationError(2, { ...business, contactName: "" })).toBe(
      "Choose an industry and enter the contact person’s name.",
    );
  });
  it("allows informal business without registration number and gives ownership by default", () => {
    expect(registrationError(2, business)).toBeNull();
    expect(createDemoProfile(business, "business-1")).toMatchObject({
      id: "business-1",
      role: "owner",
      businessStatus: "informal",
      skills: [],
      registrationNumber: "",
    });
  });
  it("does not persist optional phone data", () => {
    expect(createDemoProfile(individual, "person-1")).not.toHaveProperty("phone");
  });
  it("requires demo consent", () => {
    expect(registrationError(4, { ...individual, consent: false })).toBe(
      "Confirm that you will use demo information only.",
    );
  });
  it("revalidates details at final review", () => {
    expect(registrationError(4, { ...individual, email: "bad" })).toBe(
      "Enter a valid demo email address.",
    );
  });
  it("requires at least one appropriate goal", () => {
    expect(registrationError(3, { ...business, activities: ["Find employment"] })).toBe(
      "Choose at least one goal for this account type.",
    );
    expect(registrationError(3, { ...individual, activities: [] })).toBe(
      "Choose at least one goal for this account type.",
    );
  });
  it("does not offer management as a goal and keeps hiring opt-in", () => {
    expect(goalOptions("Business").map((g) => g.label)).toEqual([
      "Recruit workers",
      "Offer business services",
      "Find subcontractors / hire support",
    ]);
    expect(dashboardSections(createDemoProfile(business, "b").activities).hiring).toBe(false);
    expect(dashboardSections([...individual.activities, "Hire workers"]).hiring).toBe(true);
  });
});
describe("Legacy preservation and trust", () => {
  it.each(["Individual", "Business"] as const)(
    "migrates a legacy %s without changing IDs or historical records",
    (kind) => {
      const legacy = {
        ...initialState(),
        account: {
          id: "legacy-1",
          kind,
          name: "Legacy Demo",
          email: "legacy@example.com",
          location: "Windhoek",
          skills: ["React"],
          activities: ["Manage a business"],
        },
        applications: [
          {
            id: "app-1",
            accountId: "legacy-1",
            jobId: "frontend-developer",
            message: "Already saved",
          },
        ],
      } as unknown as DemoState;
      const migrated = migrateDemoState(legacy);
      expect(migrated.account?.id).toBe("legacy-1");
      expect(migrated.account?.activities).toEqual(["Hire workers"]);
      expect(migrated.applications).toEqual(legacy.applications);
      expect(migrated.jobs).toEqual(legacy.jobs);
      expect(migrated.account?.role).toBe(kind === "Business" ? "owner" : undefined);
    },
  );
  it("loads migration without rewriting storage", () => {
    const legacy = {
      ...initialState(),
      account: {
        id: "old",
        name: "Legacy",
        email: "old@example.com",
        kind: "Business",
        location: "Windhoek",
        skills: [],
        activities: ["Manage a business"],
      },
    };
    const raw = JSON.stringify(legacy);
    localStorage.setItem("workpassport-demo-v1", raw);
    expect(demoRepository.load().account?.role).toBe("owner");
    expect(localStorage.getItem("workpassport-demo-v1")).toBe(raw);
    demoRepository.reset();
  });
  it("preserves saved profile while signed out", () => {
    const profile = createDemoProfile(individual, "person-1");
    const migrated = migrateDemoState({ ...initialState(), account: null, savedAccount: profile });
    expect(migrated.account).toBeNull();
    expect(migrated.savedAccount?.id).toBe("person-1");
  });
  it("never grants a demo verification", () => {
    expect(trustStatus()).toBe("Not submitted");
  });
});
describe("Local guided help", () => {
  it.each(faq)("answers the suggested question: $question", async (entry) => {
    expect(await localAssistant.ask({ question: entry.question, path: "/" })).toEqual({
      answer: entry.answer,
      source: "local-faq",
    });
  });
  it("prioritizes verification safeguards over job keywords", async () => {
    const reply = await localAssistant.ask({
      question: "Am I verified and eligible for this job?",
      path: "/dashboard",
    });
    expect(reply.answer).toContain("Verification is not live.");
  });
});
