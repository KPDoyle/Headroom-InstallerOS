# Headroom Installer OS

Headroom Installer OS is a connected operating workspace for UK renewable-energy installers. It combines project delivery, installation evidence, MCS compliance, MID preparation, customer handover, product control, territory intelligence and full workspace administration in one Headroom-branded application.

## Live application

- Production: https://headroom-installeros.vercel.app
- Source: https://github.com/KPDoyle/Headroom-InstallerOS

The GitHub `main` branch is the production source of truth. Vercel's Git integration builds every push with native Next.js and publishes successful `main` deployments to the production URL. Pull requests receive preview deployments.

## Functional modules

- **Sites & Projects** — create, search, filter and select connected installation records.
- **SiteProof** — upload time-stamped photo/PDF evidence, track evidence gates and request Technical Supervisor review.
- **Compliance Hub** — manage accountable roles, competency qualifications, expiry signals and corrective actions.
- **MID Preflight** — validate the installation record, calculate readiness, copy or download the authorised-entry sheet and open official MID guidance.
- **Customer Passport** — upload handover documents, export the passport record and prepare a customer email.
- **Product Guard** — capture installed serials, export product evidence and open the live MCS Product Directory for authoritative checks.
- **Territory Intelligence** — validate complete UK postcodes through Postcodes.io/ONSPD, retrieve geographic and nearby-area data, calculate a transparent workspace-based Headroom score, save and compare analyses, export CSV evidence, create campaign briefs, open map searches and access current MCS/ENA market resources. The module deliberately avoids presenting invented installer counts or adoption figures as live data.
- **Administration Centre** — manage users, roles and account status; configure security policies and workflow automation; monitor integrations; maintain installer organisation details; export backups; and search or export the audit trail.

Global navigation also includes project search (`Cmd/Ctrl + K`), notifications, saved-state status, workspace backup and an official integrations directory.

## Official integrations

The application links to the MCS Product Directory, MCS Standards & Tools Library, MID installer guidance, MCS Data Dashboard, ENA DNO lookup and ENA Connect Direct. Territory geography is retrieved from the free Postcodes.io API, backed by the ONS Postcode Directory. Credential-gated MID submission remains an authorised-installer action; Headroom prepares and validates the copy sheet without impersonating that submission.

## Data and files

- The current staged release runs in a clearly labelled public-preview mode with one shared Administrator workspace and no login prompt.
- Supabase Auth remains implemented for passwordless, individual installer accounts and secure server-managed sessions when access control is switched back on.
- Supabase Postgres holds organisation-scoped workspace data, account profiles and durable audit events.
- The private Supabase `installer-documents` bucket holds evidence and handover documents up to 10 MB; files are streamed through authenticated application routes.
- Row-level security isolates each organisation. Administrators manage users, roles and suspension; Auditors receive read-only access.
- There is no local-browser data fallback. If the shared service is unavailable, the interface reports the failed save instead of creating an ungoverned copy.

Connect a Supabase integration to the Vercel project for Production, Preview and Development. The application accepts the current `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_SECRET_KEY` names and the legacy anon / service-role names. It also requires `POSTGRES_URL_NON_POOLING` (or `POSTGRES_URL` / `DATABASE_URL`). See `.env.example`.

On the first successful health check the server idempotently installs the maintained schema and private storage policies. Set `HEADROOM_REQUIRE_LOGIN=true` in Vercel and redeploy when individual accounts should become mandatory. The first authenticated person then becomes the bootstrap Administrator; subsequent accounts are invited from Administration Centre.

Public-preview mode is intended for demonstration and product development only. Anyone with the URL can view or change the shared workspace, so do not enter live customer information until login is re-enabled.

## Development

Requirements: Node.js 24.

```bash
npm ci
npm run dev
```

Useful checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

`npm run build` creates the same native Next.js production artifact used by Vercel.

## Project structure

- `app/page.tsx` — authenticated server entry point
- `app/installer-app.tsx` — Headroom interface and installer workflows
- `app/api/workspace/route.ts` — organisation-scoped Supabase Postgres workspace API
- `app/api/files/route.ts` — authenticated private Supabase document API
- `app/api/admin/users/*` — invitations, roles, status and access administration
- `app/api/territory/route.ts` — live UK postcode intelligence API
- `app/api/health/route.ts` — deployment, database and storage readiness signal
- `lib/schema.ts` / `supabase/migrations/*` — database and row-level security schema
- `proxy.ts` — Supabase session refresh and route protection
- `vercel.json` — explicit native Next.js build configuration
- `.github/workflows/ci.yml` — GitHub checks for tests, lint, types and production build

## Important scope

Headroom Installer OS assists with workflow completeness and evidence preparation. It does not replace MCS certification, Technical Supervisor judgment, Certification Body assessment, DNO approval or authorised MID submission.
