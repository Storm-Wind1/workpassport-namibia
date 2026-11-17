export type Activity =
  "Find employment" | "Offer freelance services" | "Hire workers" | "Hire support";
export const activities: Activity[] = [
  "Find employment",
  "Offer freelance services",
  "Hire workers",
];
export const categories = [
  "IT",
  "Construction",
  "Agriculture",
  "Cleaning",
  "Carpentry",
  "Gardening",
  "Design",
  "General labour",
];
export const locations = [
  "Windhoek",
  "Swakopmund",
  "Walvis Bay",
  "Oshakati",
  "Rundu",
  "Otjiwarongo",
];
export const jobTypes = ["Permanent", "Temporary gig", "Freelance project", "Skilled labour"];
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  type: string;
  pay: string;
  description: string;
  skills: string[];
  owner?: string;
}
export interface Worker {
  id: string;
  name: string;
  role: string;
  location: string;
  skills: string[];
  initials: string;
  available: boolean;
  bio: string;
  experience: string[];
  portfolio: string[];
  references: string[];
}
export interface Account {
  id: string;
  name: string;
  email: string;
  kind: "Individual" | "Business";
  activities: Activity[];
  location: string;
  skills: string[];
  industry?: string;
  contactName?: string;
  businessStatus?: "informal" | "registered";
  registrationNumber?: string;
  role?: "owner";
}
export interface Application {
  id: string;
  jobId: string;
  accountId: string;
  message: string;
}
export interface Quote {
  id: string;
  workerId: string;
  accountId: string;
  description: string;
  budget: string;
}
export interface Service {
  id: string;
  accountId: string;
  title: string;
  price: string;
}
export interface DemoState {
  account: Account | null;
  savedAccount?: Account | null;
  jobs: Job[];
  applications: Application[];
  quotes: Quote[];
  services: Service[];
}

export function goalOptions(kind: Account["kind"]): { value: Activity; label: string }[] {
  return kind === "Business"
    ? [
        { value: "Hire workers", label: "Recruit workers" },
        { value: "Offer freelance services", label: "Offer business services" },
        { value: "Hire support", label: "Find subcontractors / hire support" },
      ]
    : [
        { value: "Find employment", label: "Find work" },
        { value: "Offer freelance services", label: "Offer a service" },
        { value: "Hire workers", label: "Hire help" },
      ];
}
export function goalLabel(value: Activity, kind: Account["kind"]) {
  return goalOptions(kind).find((x) => x.value === value)?.label ?? value;
}
