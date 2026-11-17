import { jobs } from "./data";
import { goalOptions, type Account, type DemoState, type Job, type Worker } from "./types";
const KEY = "workpassport-demo-v1";
export const initialState = (): DemoState => ({
  account: null,
  jobs: [...jobs],
  applications: [],
  quotes: [],
  services: [],
});
// Device-only persistence boundary. Replace this adapter with the future API client.
export const demoRepository = {
  load(): DemoState {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    const value = JSON.parse(raw) as DemoState;
    if (
      !value ||
      !Array.isArray(value.jobs) ||
      !Array.isArray(value.applications) ||
      !Array.isArray(value.quotes) ||
      !Array.isArray(value.services)
    )
      throw new Error("Invalid demo data");
    return migrateDemoState(value);
  },
  save(value: DemoState) {
    localStorage.setItem(KEY, JSON.stringify(value));
  },
  reset() {
    localStorage.removeItem(KEY);
  },
};
export function matchReasons(
  job: Job,
  profile: Pick<Account | Worker, "skills" | "location">,
): string[] {
  const reasons: string[] = [];
  const skills = job.skills.filter((s) =>
    profile.skills.some((p) => p.toLowerCase() === s.toLowerCase()),
  );
  if (skills.length) reasons.push(`Skills match: ${skills.join(", ")}`);
  if (job.location === profile.location) reasons.push(`In your area: ${job.location}`);
  return reasons;
}
export function dashboardSections(activities: Account["activities"]) {
  return {
    employment: activities.includes("Find employment"),
    services: activities.includes("Offer freelance services"),
    hiring: activities.includes("Hire workers") || activities.includes("Hire support"),
  };
}

export function migrateAccount(input: Account): Account {
  const allowed = goalOptions(input.kind).map((x) => x.value);
  const legacy = input.activities as string[];
  const mapped = legacy
    .map((a) => (a === "Manage a business" ? "Hire workers" : a))
    .filter((a) => allowed.some((v) => v === a));
  const selected = allowed.filter((a) => mapped.includes(a));
  const { role: _role, ...rest } = input;
  return {
    ...rest,
    skills: Array.isArray(input.skills) ? input.skills : [],
    activities: selected.length
      ? selected
      : [input.kind === "Business" ? "Hire workers" : "Find employment"],
    ...(input.kind === "Business"
      ? { role: "owner" as const, businessStatus: input.businessStatus ?? "informal" }
      : {}),
  };
}
export function migrateDemoState(value: DemoState): DemoState {
  return {
    ...value,
    account: value.account ? migrateAccount(value.account) : null,
    savedAccount: value.savedAccount
      ? migrateAccount(value.savedAccount)
      : value.account
        ? migrateAccount(value.account)
        : null,
  };
}
export function trustStatus(): "Not submitted" {
  return "Not submitted";
}
