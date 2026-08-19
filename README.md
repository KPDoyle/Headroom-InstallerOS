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

- Private Vercel Blob storage holds the shared organisation workspace state.
- Private Vercel Blob storage also holds evidence and handover documents up to 10 MB each; files are streamed through the application rather than exposed publicly.
- Registered in-app users can be suspended, while administration changes require an Administrator role when an authenticated identity header is supplied by the access layer.
- Administration changes, access decisions, workflow controls and data operations are recorded in the searchable audit history.
- If hosted storage is unavailable, the browser clearly switches to `LOCAL` fallback mode instead of losing changes.

The Vercel project requires a connected private Blob store. Vercel automatically supplies `BLOB_READ_WRITE_TOKEN`, or `BLOB_STORE_ID` with its rotating deployment OIDC token.

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

The normal `npm run build` creates and validates the Vinext/Cloudflare Worker artifact. Setting `VERCEL=1` creates a standard Next.js production build for Vercel.

## Project structure

- `app/page.tsx` — Headroom interface and installer workflows
- `app/api/workspace/route.ts` — private Vercel Blob workspace API
- `app/api/files/route.ts` — private Vercel Blob evidence and document API
- `app/api/territory/route.ts` — live UK postcode intelligence API
- `app/api/health/route.ts` — deployment and storage health signal
- `vercel.json` — explicit native Next.js build configuration
- `.github/workflows/ci.yml` — GitHub checks for tests, lint, types and production build

## Important scope

Headroom Installer OS assists with workflow completeness and evidence preparation. It does not replace MCS certification, Technical Supervisor judgment, Certification Body assessment, DNO approval or authorised MID submission.
