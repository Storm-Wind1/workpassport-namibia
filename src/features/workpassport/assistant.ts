export interface HelpRequest {
  question: string;
  path: string;
}
export interface HelpResponse {
  answer: string;
  source: "local-faq" | "on-device-ai";
}
export interface AssistantService {
  ask(request: HelpRequest): Promise<HelpResponse>;
}
export const faq = [
  {
    question: "What is WorkPassport?",
    pattern: /what.*workpassport|what.*platform/i,
    answer:
      "WorkPassport brings your skills, experience and goals together in a portable work profile. It is for Namibian jobseekers, tradespeople, freelancers and small businesses. This is a local demo, not a live hiring service.",
  },
  {
    question: "Which profile should I choose?",
    pattern: /which.*profile|individual|sign.?up|joining/i,
    answer: "Select Sign up, then choose Individual if the profile is for you. Choose Business if you represent a shop, company or informal business. Select Next to see the details for that profile.",
  },
  {
    question: "How do I log in again?",
    pattern: /log.?in|sign.?in|resume|password/i,
    answer: "Select Log in on the device and browser where you created your demo profile. Select Resume saved demo. If this browser has no saved profile, choose Create demo profile.",
  },
  {
    question: "How do I find a job?",
    pattern: /job|find work|employment/i,
    answer:
      "Create an Individual demo profile and choose Find work. Open your dashboard, then Browse opportunities. Search by skill or town and save a demo application. It stays on this device; no employer is contacted.",
  },
  {
    question: "How do I hire someone?",
    pattern: /hire|recruit|subcontract/i,
    answer:
      "Choose Hire help as an Individual, or Recruit workers / Find subcontractors as a Business. Your dashboard shows talent and posting tools. You can add hiring later without another account. All hiring is a demo.",
  },
  {
    question: "Do I need experience?",
    pattern: /experience|rating/i,
    answer:
      "No. Your skills, availability and preferred distance help find matches. You can change these on your dashboard. Missing experience or ratings never reduces your matches. Skills you enter are self-declared, not verified.",
  },
  {
    question: "What does verified mean?",
    pattern: /verif|police|good conduct|clearance|trustworth|credential|safe|eligible/i,
    answer:
      "Verification is not live. No click here can verify identity, references or credentials. A future secure review must check evidence and record an authoritative decision. Police clearance may be relevant for some roles, but is not required for everyone and does not prove competence or safety.",
  },
  {
    question: "How do I register my business?",
    pattern: /business|trading name|company|owner|admin/i,
    answer:
      "Select Sign up, then Business. Add a trading name, town, industry and contact person. Informal businesses are welcome; a registration number is optional text, not proof. The creator is the demo workspace owner/admin. Staff delegation comes later.",
  },
  {
    question: "How can people find my profile?",
    pattern: /directory|discover|list my profile/i,
    answer: "On your individual dashboard, select List my profile in this browser’s worker directory. Other demo users of this browser can then search for your name, town or skills. Clear the box to remove your listing. Cross-device listings need the shared service.",
  },
  {
    question: "How do I change my activities?",
    pattern: /activit|goal|change/i,
    answer:
      "Open Dashboard and select Add activity. Choose your goals and save. An Individual can add Hire help without creating a new account. Your existing demo records stay on this device.",
  },
  {
    question: "How do quotes work?",
    pattern: /quot|budget/i,
    answer:
      "Open a worker’s WorkPassport and describe your project and budget in N$. Request demo quotation saves it locally; it does not send a message, accept a contract or process a payment.",
  },
  {
    question: "How can I get assistance if I struggle to use technology?",
    pattern: /technology|struggle|assist|help|support/i,
    answer:
      "Take one step at a time; you can go back before creating a profile. Ask a trusted person to guide you using demo details, never give them identity documents or banking information. Live human assistance is not connected yet. This guide can explain each step.",
  },
];
export function pageHint(path: string) {
  if (path.startsWith("/opportunities")) return "Choose a listing to read the job details. On Find work, use a town or skill to narrow the list.";
  if (path.startsWith("/talent") || path.startsWith("/passport")) return "Open a worker’s profile to read about their skills and experience.";
  if (path === "/post-job") return "Describe the work, choose a town and review your demo listing before posting.";
  return path === "/join"
    ? "Choose a profile type, add demo details, pick goals, then review. Back lets you change your choices."
    : path === "/dashboard"
      ? "Your dashboard follows your goals. Add activity opens more options whenever you need them."
      : path === "/trust"
        ? "Evidence collection is disabled. No sensitive documents should be entered here."
        : path === "/login"
          ? "Resume a saved demo on this device. This is not secure authentication."
          : "You can learn about WorkPassport before creating a demo profile. No live hiring or verification takes place.";
}
export const localAssistant: AssistantService = {
  async ask({ question, path }) {
    const normalized = question.trim().toLowerCase();
    const entry =
      faq.find((f) => f.question.toLowerCase() === normalized) ??
      faq.find(
        (f) =>
          /verif|police|good conduct|clearance|trustworth|credential|safe|eligible/i.test(normalized) &&
          f.question === "What does verified mean?",
      ) ??
      faq.find((f) => f.question === "How do I register my business?" && /business|company|owner|admin/i.test(normalized) && !/hire|recruit|quot/i.test(normalized)) ??
      faq.find((f) => f.pattern.test(normalized));
    if (!entry && /stuck|what.*next|where.*start|what.*here/i.test(normalized)) {
      return { source: "local-faq", answer: pageHint(path) };
    }
    if (!entry) {
      const answer = await matchWithBrowserAI(question);
      if (answer) return { source: "on-device-ai", answer };
    }
    return {
      source: "local-faq",
      answer:
        entry?.answer ??
        "I can explain registration, activities, jobs, hiring, quotations or verification. Try one of the suggested questions. I cannot decide eligibility or verify anyone. Live human support is not available in this demo.",
    };
  },
};

interface BrowserModel {
  availability(): Promise<string>;
  create(options: { signal: AbortSignal }): Promise<{
    prompt(input: string, options: { signal: AbortSignal }): Promise<string>;
    destroy(): void;
  }>;
}

async function matchWithBrowserAI(question: string): Promise<string | undefined> {
  const model = (globalThis as typeof globalThis & { LanguageModel?: BrowserModel }).LanguageModel;
  if (!model) return;
  let session: Awaited<ReturnType<BrowserModel["create"]>> | undefined;
  try {
    if ((await model.availability()) !== "available") return;
    const signal = AbortSignal.timeout(5000);
    session = await model.create({ signal });
    const topics = faq.map((entry, index) => [index, entry.question]);
    const result = await session.prompt(
      "Choose the closest FAQ topic. Reply with its integer index, or NONE if unrelated. " +
        JSON.stringify({ topics, question: question.slice(0, 400) }),
      { signal },
    );
    const index = result.trim();
    if (/^(0|[1-9]\d*)$/.test(index)) return faq[Number(index)]?.answer;
  } catch {
    // The written guide also works when the local model is busy or unavailable.
  } finally {
    session?.destroy();
  }
}
