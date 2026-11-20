import { describe, it, expect } from "vitest";
import type { Account } from "./types";
import { directoryWorkers, rememberProfiles, jobMatch, matchReasons, dashboardSections, demoRepository, initialState } from "./service";
import { jobs, workers } from "./data";
describe("WorkPassport rules", () => {
  const job = jobs.find((j) => j.id === "frontend-developer");
  const worker = workers.find((w) => w.id === "petrus");
  if (!job || !worker) throw new Error("Required demo fixtures are missing");
  it("matches self-declared skills without a rating or previous experience", () => {
    expect(matchReasons(job, { skills: ["React"], location: "Rundu" })).toEqual([
      "Skills match: React",
    ]);
  });
  it("matches location independently of skills", () => {
    expect(matchReasons(job, { skills: [], location: "Windhoek" })).toEqual([
      "In your area: Windhoek",
    ]);
  });
  it("does not match unrelated skills and locations", () => {
    expect(matchReasons(job, worker)).toEqual([]);
  });
  it("limits job seeker dashboard to employment", () => {
    expect(dashboardSections(["Find employment"])).toEqual({
      employment: true,
      services: false,
      hiring: false,
    });
  });
  it("allows multiple activities including hiring later", () => {
    expect(
      dashboardSections(["Find employment", "Offer freelance services", "Hire workers"]),
    ).toEqual({ employment: true, services: true, hiring: true });
  });
  it("allows subcontractor support to access hiring", () => {
    expect(dashboardSections(["Hire support"]).hiring).toBe(true);
  });
  it("persists demo applications and quotations locally", () => {
    const state = initialState();
    state.applications.push({
      id: "app-1",
      accountId: "user-1",
      jobId: "carpenter",
      message: "I have carpentry experience.",
    });
    state.quotes.push({
      id: "quote-1",
      accountId: "user-1",
      workerId: "anna",
      description: "Design my cafe logo",
      budget: "4500",
    });
    demoRepository.save(state);
    expect(demoRepository.load().applications[0]?.jobId).toBe("carpenter");
    expect(demoRepository.load().quotes[0]?.budget).toBe("4500");
    demoRepository.reset();
  });
});

describe("work preferences", () => {
  const job = { ...jobs[0]!, skills:["React","Design"], location:"Walvis Bay" };
  const profile = { skills:["React"], location:"Swakopmund", radiusKm:50 };
  it("checks town distance, availability and mandatory skill coverage", () => {
    expect(matchReasons(job, profile).join(" ")).toContain("31 km");
    expect(matchReasons(job, { ...profile, radiusKm:25 })).toEqual([]);
    expect(matchReasons(job, { ...profile, available:false })).toEqual([]);
    expect(matchReasons({ ...job, requireAllSkills:true }, profile)).toEqual([]);
  });
  it("ranks a stronger match ahead of a partial skill match", () => {
    expect(jobMatch(job,{ ...profile, skills:["React","Design"] }).score).toBeGreaterThan(jobMatch(job,profile).score);
  });
});

it("lists only consenting individuals and preserves another worker when switching profiles", () => {
  const first: Account = { id:"one",name:"Demo One",email:"one@example.test",activities:["Find employment"],kind:"Individual",location:"Rundu",skills:[],listed:true };
  const second: Account = { ...first,id:"two",name:"Demo Two",listed:false };
  const state = { ...initialState(), profiles:[first], account:second };
  const profiles = rememberProfiles(state);
  const directory = directoryWorkers({ ...state,profiles });
  expect(directory.find(worker=>worker.id==="one")).not.toHaveProperty("email");
  expect(directory.some(worker=>worker.id==="one")).toBe(true);
  expect(directory.some(worker=>worker.id==="two")).toBe(false);
  expect(directoryWorkers({ ...state,profiles:rememberProfiles({ ...state,account:{...first,listed:false} }) }).some(worker=>worker.id==="one")).toBe(false);
});
