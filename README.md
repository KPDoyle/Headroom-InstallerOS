# Headroom Installer OS

A connected operating system for MCS-certified renewable installers, combining site evidence, compliance, certificate preparation, customer handover, product verification and territory intelligence.

## Live application

[Open Headroom Installer OS](https://headroom-installer-os.kevin-doyle296372.chatgpt.site)

## Product areas

- **Command Centre** — a single installation journey from site screening through customer handover.
- **Sites & Projects** — portfolio, crew capacity and job-readiness visibility.
- **SiteProof** — guided evidence capture and Technical Supervisor review gates.
- **Compliance Hub** — accountable roles, qualifications, corrective actions and audit readiness.
- **MID Preflight** — validates required installation data before authorised entry in the MCS Installations Database.
- **Customer Passport** — branded certificates, warranties, guidance and service records.
- **Product Guard** — product certification, serial checks and substitution control.
- **Territory Intelligence** — postcode opportunity scoring and installer-density signals.

## Brand system

The interface follows the Headroom visual language: Sora typography, deep navy `#04142B`, gold `#F5B400`, compact uppercase labels and evidence-led status cards.

## Technology

- React 19
- Next.js 16
- Vinext/Vite
- TypeScript
- Tailwind CSS
- Lucide icons
- Cloudflare-compatible Worker output
- Optional Drizzle/D1 scaffolding

## Local development

Requires Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

Run validation with:

```bash
npm test
```

## Current status

This repository contains the interactive product prototype. It uses realistic demonstration data. Production operation will require persistent storage, role-based authentication, document uploads and authorised MCS/MID integrations.
