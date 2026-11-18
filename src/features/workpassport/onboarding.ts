import type { Account, Activity } from "./types";
import { goalOptions } from "./types";
export interface Registration {
  kind: Account["kind"];
  name: string;
  email: string;
  location: string;
  skills: string;
  phone: string;
  industry: string;
  contactName: string;
  businessStatus: "informal" | "registered";
  registrationNumber: string;
  activities: Activity[];
  consent: boolean;
}
export function registrationError(step: number, d: Registration): string | null {
  if (step === 2 || step === 4) {
    if (d.name.trim().length < 2)
      return d.kind === "Business"
        ? "Enter your business or trading name."
        : "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return "Enter a valid demo email address.";
    if (!d.location.trim()) return "Choose your town.";
    if (d.kind === "Business" && (!d.industry || d.contactName.trim().length < 2))
      return "Choose an industry and enter the contact person’s name.";
  }
  if (
    (step === 3 || step === 4) &&
    (!d.activities.length ||
      d.activities.some((a) => !goalOptions(d.kind).some((g) => g.value === a)))
  )
    return "Choose at least one goal for this account type.";
  if (step === 4 && !d.consent) return "Confirm that you will use demo information only.";
  return null;
}
export function createDemoProfile(d: Registration, id: string): Account {
  return {
    id,
    kind: d.kind,
    name: d.name.trim(),
    email: d.email.trim(),
    location: d.location,
    activities: d.activities,
    skills:
      d.kind === "Individual"
        ? d.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    ...(d.kind === "Business"
      ? {
          industry: d.industry,
          contactName: d.contactName.trim(),
          businessStatus: d.businessStatus,
          registrationNumber: d.businessStatus === "registered" ? d.registrationNumber.trim() : "",
          role: "owner" as const,
        }
      : {}),
  };
}
