# Headroom Installer OS

Headroom Installer OS is a connected operating workspace for UK renewable-energy installers. It combines project delivery, installation evidence, MCS compliance, MID preparation, customer handover, product control, territory intelligence and full workspace administration in one Headroom-branded application.

## Live applications

- Full workspace: https://headroom-installer-os.kevin-doyle296372.chatgpt.site
- Public demonstration: https://headroom-installeros.vercel.app

The full workspace uses managed D1 and R2 bindings for saved records and files. The public Vercel demonstration automatically uses device-local fallback storage because Cloudflare bindings are not present there.

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

- D1 stores the shared organisation workspace state as a versionable JSON record and migrates the earlier owner record on first use.
- R2 stores evidence and handover documents up to 10 MB each.
- The Sites identity gate is the primary authorisation boundary. Registered in-app users can be suspended, while administration changes require an Administrator role.
- Administration changes, access decisions, workflow controls and data operations are recorded in the searchable audit history.
- If hosted storage is unavailable, the browser clearly switches to `LOCAL` fallback mode.

## Development

Requirements: Node.js 22 or later, `flock`, `curl` and GNU `timeout`.

```bash
npm ci
npm run dev
```

Useful checks:

```bash
npm run lint
npx tsc --noEmit
npm test
VERCEL=1 npm run build
```

The normal `npm run build` creates and validates the Vinext/Cloudflare Worker artifact. Setting `VERCEL=1` creates a standard Next.js production build for Vercel.

## Project structure

- `app/page.tsx` — Headroom interface and installer workflows
- `app/api/workspace/route.ts` — durable workspace API
- `app/api/files/route.ts` — evidence and document storage API
- `db/schema.ts` and `drizzle/` — D1 schema and migration
- `.openai/hosting.json` — Sites project and logical D1/R2 bindings
- `scripts/` — bounded builds and artifact verification

## Important scope

Headroom Installer OS assists with workflow completeness and evidence preparation. It does not replace MCS certification, Technical Supervisor judgment, Certification Body assessment, DNO approval or authorised MID submission.
