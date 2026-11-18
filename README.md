# WorkPassport Namibia

A frontend foundation for a Namibian employment and freelance marketplace. All people, businesses, opportunities and activity are illustrative demo data. No backend, paid services, real authentication or payments are connected.

## Local development

Requires Node.js 22+ and Bun (or npm).

```sh
bun install
bun run dev
bun run test
bun run build
```

The app uses React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui and TanStack Start/Router. TanStack Router is the routing system provided by the Lovable template (not React Router). Keep its Vite plugin and generated route tree intact. `bun run dev` prints the local URL.

## Source structure

```text
src/
  assets/                     Generated workshop image
  components/ui/              Reusable shadcn primitives
  features/workpassport/
    types.ts                  Domain models and option sets
    data.ts                   Literal seeded demonstration data
    service.ts                Persistence adapter and pure matching rules
    service.test.ts           Domain rule and persistence tests
    context.tsx               Demo state provider, hydration and save failures
    shared.tsx                Cards, headers and metadata helpers
    shell.tsx                 Shared navigation and footer
    profile.tsx               Reusable digital WorkPassport
    onboarding.ts             Branched registration validation and profile creation
    onboarding.test.ts        Registration, legacy migration, trust and FAQ tests
    assistant.ts              Typed local FAQ adapter and contextual guidance
    help.tsx                  Global accessible guided-help dialog
  routes/                     Typed file-based pages
  styles.css                  Semantic design tokens and responsive styles
  test/                       Routing tests and test setup
```

## Demo flows

- Create an Individual or Business account and select multiple activities.
- Add/remove activities and edit self-declared skills from the dashboard.
- Search/filter jobs; submit a demo application; create a job posting.
- Browse workers, share seeded profiles and save a demo quotation request.
- Add freelance services with an N$ starting price.

`workpassport-demo-v1` in localStorage stores all demo changes. Data stays on one browser and is not transmitted to other users. Demo logout clears only the current account; it is not secure authentication. To reset the demo, remove that localStorage key in the browser’s developer tools. Do not enter sensitive information. Seeded talent profile links work on other devices; personal profile links cannot transfer local data.

Skills and location explain matching. Missing ratings and previous experience never reduce matching. Skills, experience, references and portfolio examples are self-reported demonstration content, not verified credentials. Portfolio entries are illustrative project descriptions rather than actual portfolio uploads.

## Future integration

Replace `demoRepository` with an asynchronous FastAPI client, introduce real identity/session handling and move records to PostgreSQL. The UI uses typed domain records and central pure matching rules. Add server-side validation, ownership/permission checks and identity verification before production use. The current prototype has no secure accounts, actual job delivery, file uploads or communication channels.

## Team workflow

Connect this project to GitHub in Lovable to synchronize its source. Develop in branches and review pull requests; never edit `src/routeTree.gen.ts` by hand. Commit `bun.lock` alongside dependency changes. Keep domain behavior tests next to `service.ts` and page metadata in each content route.

## Guided registration and trust boundaries

The public homepage explains the platform before registration. `/join` has four stages: account type, branched demo details, goals and review with demo consent. Individuals can add hiring later. Businesses have trading details (informal or registered, always unverified); their creator is the workspace owner/admin, not a signup goal. Optional phone text is ephemeral and never persisted. Registration numbers are optional demo text, never documents. Do not use real private details.

`/login` resumes a saved demo on this device; it is explicitly not authentication. Logout clears the active profile but retains `savedAccount`. The existing `workpassport-demo-v1` key is migrated in memory: legacy business management becomes a hiring goal and business ownership is normalized. IDs, jobs, applications, quotations and service records are preserved. Legacy stored records are not deleted or rewritten until a user explicitly saves an action.

`/trust` distinguishes Not submitted, Awaiting review and Verified as process stages. Only Not submitted is available now. No click can award verification. Document collection is disabled: no IDs, police clearance, certificates, bank information or files are stored. Police clearance is optional for relevant trust-sensitive roles and never proof of competence or safety. Business registration, authorized representation and contact evidence need independent checks. Informal businesses are honestly labelled.

### Future secure implementation

Add server-enforced authentication, ownership, RBAC and audit logging before accepting actual data. A business creator must receive ownership through a server transaction; staff delegation is a future enhancement. Frontend guards and local role labels are presentation, not security. Verification must use access-controlled secure evidence storage, reviewer roles, scoped authoritative statuses, immutable audit events, retention rules and explicit consent. Never infer verified identity, skill, safety or eligibility from client state.

### Guided Help (demo)

`assistant.ts` defines `AssistantService`, typed requests/responses, local FAQ matching and page hints. `help.tsx` provides the global keyboard-accessible dialog, suggested questions and text input. It makes no remote calls and saves no conversation to localStorage. Live human support is not connected.

A future AI adapter must call an authenticated, rate-limited server proxy; never expose credentials in the browser. Ground answers in approved help content, cite sources, reject verification and eligibility decisions, minimize personal data, use uncertainty/fallbacks to mitigate hallucinations, and offer explicit human handoff when a real support channel exists. AI cannot create verified badges or authorize workspace access.

Hiring tools are opt-in for individuals and follow the selected business goals. Posting does not silently add a goal: choose hiring in the dashboard first. The posting page pre-fills the active business trading name after device data loads. This is UX guidance only, not a security boundary.
