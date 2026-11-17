<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## WorkPassport architecture
- Use TanStack file routes for pages and a shared root shell; the supplied framework owns navigation and route generation.
- Keep demo persistence and matching in the domain service adapter, separate from presentation; this enables a future API replacement without duplicating business logic.
- Read browser persistence only after hydration and write only through explicit actions; SSR must render stable defaults and storage failures must be visible.
- Model the initial experience as local demo state without external services; production identity and record ownership require a future backend implementation.

- Use trailing-underscore un-nested detail routes beside list content pages; list pages do not render an Outlet, so nested detail pages would be hidden.
- Preserve the legacy storage key and record IDs while normalizing saved profiles; sessions and resumable profiles are separate device-only values.
- Keep registration validation and goal-to-feature mapping in domain helpers; account kind determines choices, while business ownership is inherent rather than a goal.
- Guided help uses a typed async local adapter behind a shared provider; future remote assistance requires a server proxy and cannot award trust statuses.
- Demo trust status is always not submitted with document actions disabled; authoritative verification and permissions must come from a future backend.
