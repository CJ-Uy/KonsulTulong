# KonsulTulong

A pre-consultation triage tool for small clinics. Patients answer a few standard intake questions on their own phone while waiting, the secretary keeps the queue in order, and the doctor sees a one-screen summary before the patient walks in.

Not an EMR. Not a billing system. Not an appointment scheduler. The point is to give the doctor a head start so they can spend more time on what is actually wrong.

## Status

Active development. See `docs/PLAN.md` for the full implementation plan and locked decisions.

## How it works

1. Patient checks in with the secretary at the front desk. Their name goes on the queue and they get a number.
2. The wall has a QR poster for the clinic. The patient can optionally scan it on their own phone and fill out the form while waiting. They do not have to.
3. The patient enters their name, birthdate, sex, and an optional phone number, then answers a wizard-style form (one question per screen, big buttons, audio cues, language toggle).
4. Submit. The patient gets a thank-you screen. No score is shown to them.
5. The secretary sees the new response in the incoming pane, matches it to the right queue row by name, or drops it on a new row if the patient never checked in first.
6. The doctor advances the queue when they finish a consult. The doctor view jumps to the next patient's response, or shows "no form submitted" if there is nothing.

## Stack

- SvelteKit 2.x with Svelte 5
- TypeScript
- Cloudflare Workers (via `@sveltejs/adapter-cloudflare`)
- D1 (SQLite) via Drizzle ORM
- R2 for file storage
- Better-Auth on D1 (email and password)
- Bits UI + Tailwind CSS 4

## Local development

You need Node 22+, pnpm, and a Cloudflare account with a D1 database and an R2 bucket created. The bindings live in `wrangler.jsonc`.

```bash
pnpm install
pnpm dev
```

To generate or update database migrations:

```bash
pnpm db:generate
pnpm wrangler d1 execute konsultulong --remote --file=drizzle/<latest>.sql
```

If you want to run against the dev D1 HTTP API instead of a real binding (handy outside Miniflare), put these in `.env`:

```
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_D1_DATABASE_ID=...
CLOUDFLARE_D1_TOKEN=...
```

## Deploy

```bash
pnpm build
pnpm wrangler deploy
```

Bindings, account ID, and D1 + R2 IDs are in `wrangler.jsonc`. Secrets go through `wrangler secret put`.

## Project layout

```
src/
  app.d.ts            // Platform + Locals types
  hooks.server.ts     // DB injection, auth resolution, route guards
  lib/
    auth.ts           // Better-Auth factory (per-request)
    db/
      index.ts        // D1 client factory
      schema.ts       // Drizzle schema (SQLite)
    storage/r2.ts     // R2 upload, fetch, delete + attachment rows
    types/            // Shared domain types
    utils/ids.ts      // shortCode, uuid, manilaDateString
    components/ui/    // Bits UI primitives
  routes/
    (public)/         // Public-facing pages including auth
    c/[code]/         // Patient kiosk entry point
    dashboard/        // Secretary, doctor, admin views
    api/              // JSON endpoints
docs/
  PLAN.md             // Full implementation plan and locked decisions
drizzle/              // SQL migrations
wrangler.jsonc        // Cloudflare config
```

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Vite dev server |
| `pnpm build` | Build for Workers via adapter-cloudflare |
| `pnpm preview` | Local preview of the production build |
| `pnpm check` | Type check |
| `pnpm format` | Prettier write |
| `pnpm lint` | Prettier check plus ESLint |
| `pnpm db:generate` | Generate Drizzle SQL migration |
| `pnpm db:studio` | Drizzle Studio |

## Plan

The full plan, locked decisions, schema sketch, phase list, and bundle-size targets are in [`docs/PLAN.md`](docs/PLAN.md). If something looks odd or out of place, that doc is the single source of truth.
