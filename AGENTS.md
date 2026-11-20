# Team development

Use short-lived task branches from `develop`. Open pull requests into `develop` and promote tested releases to `main`. Keep credentials outside the repository and preserve generated route files.

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
