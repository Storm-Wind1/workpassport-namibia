export interface HelpRequest {
  question: string;
  path: string;
}
export interface HelpResponse {
  answer: string;
  source: "local-faq";
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
      "No. Your skills and location help find matches. Missing experience or ratings never reduces your matches. Skills you enter are self-declared, not verified.",
  },
  {
    question: "What does verified mean?",
    pattern: /verif|police|credential|safe|eligible/i,
    answer:
      "Verification is not live. No click here can verify identity, references or credentials. A future secure review must check evidence and record an authoritative decision. Police clearance may be relevant for some roles, but is not required for everyone and does not prove competence or safety.",
  },
  {
    question: "How do I register my business?",
    pattern: /business|register/i,
    answer:
      "Choose Business at Get started. Add a trading name, town, industry and contact person. Informal businesses are welcome; a registration number is optional text, not proof. The creator is the demo workspace owner/admin. Staff delegation comes later.",
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
  async ask({ question }) {
    const normalized = question.trim().toLowerCase();
    const entry =
      faq.find((f) => f.question.toLowerCase() === normalized) ??
      faq.find(
        (f) =>
          /verif|police|credential|safe|eligible/i.test(normalized) &&
          f.question === "What does verified mean?",
      ) ??
      faq.find((f) => f.pattern.test(normalized));
    return {
      source: "local-faq",
      answer:
        entry?.answer ??
        "I can explain registration, activities, jobs, hiring, quotations or verification. Try one of the suggested questions. I cannot decide eligibility or verify anyone. Live human support is not available in this demo.",
    };
  },
};
