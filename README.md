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
