import { jobs, workers } from "./data";
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
type MatchProfile = Pick<Account, "location" | "skills" | "available" | "radiusKm">;

// Approximate town centres from GeoDataKit's Namibia city table.
const centres: Record<string, [number, number]> = {
  Windhoek: [-22.56, 17.08], Rundu: [-17.92, 19.77],
  "Walvis Bay": [-22.96, 14.51], Swakopmund: [-22.68, 14.53],
  Oshakati: [-17.79, 15.70], Otjiwarongo: [-20.46, 16.65],
};

function distanceKm(from: string, to: string) {
  const a = centres[from], b = centres[to];
  if (!a || !b) return undefined;
  const rad = Math.PI / 180;
  const h = Math.sin((b[0]-a[0])*rad/2)**2 +
    Math.cos(a[0]*rad)*Math.cos(b[0]*rad)*Math.sin((b[1]-a[1])*rad/2)**2;
  return 12742 * Math.asin(Math.sqrt(h));
}

export function jobMatch(job: Job, profile: MatchProfile) {
  const reasons: string[] = [];
  const none = { reasons, score: 0 };
  if (profile.available === false) return none;
  const normalize = (skill: string) => skill.trim().toLowerCase();
  const offered = new Set(profile.skills.map(normalize));
  const required = new Map(job.skills.map(s => [normalize(s), s.trim()] as const));
  required.delete("");
  const skills = [...required].filter(([key]) => offered.has(key));
  if (job.requireAllSkills && skills.length < required.size) return none;
  const distance = distanceKm(profile.location, job.location);
  if (profile.radiusKm !== undefined && (distance === undefined || distance > profile.radiusKm)) return none;
  if (skills.length) reasons.push(`Skills match: ${skills.map(([, label]) => label).join(", ")}`);
  const sameTown = job.location === profile.location;
  if (sameTown) reasons.push(`In your area: ${job.location}`);
  else if (profile.radiusKm !== undefined && distance !== undefined)
    reasons.push(`Within your range: about ${Math.round(distance)} km between town centres`);
  const nearby = profile.radiusKm !== undefined && distance !== undefined ? 1 - distance / Math.max(profile.radiusKm, 1) : 0;
  const score = skills.length / Math.max(required.size, 1) * 4 + (sameTown ? 2 : nearby);
  return { reasons, score };
}
export function matchReasons(job: Job, profile: MatchProfile) {
  return jobMatch(job, profile).reasons;
}

export function asWorker(account: Account): Worker {
  return {
    id: account.id, name: account.name, role: "Independent professional", location: account.location,
    initials: account.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join(""),
    skills: account.skills, available: account.available !== false,
    bio: `Based in ${account.location}.`, portfolio: [], references: [], experience: [],
  };
}
export function directoryWorkers(state: DemoState): Worker[] {
  const listed = (state.profiles ?? []).filter(a => a.kind === "Individual" && a.listed === true);
  return [...listed.map(asWorker), ...workers];
}
export function rememberProfiles(state: DemoState): Account[] {
  const profiles = new Map((state.profiles ?? []).map(a => [a.id, a]));
  for (const account of [state.savedAccount, state.account]) {
    if (account) profiles.set(account.id, account);
  }
  return [...profiles.values()];
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
    profiles: rememberProfiles(value).map(migrateAccount),
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
