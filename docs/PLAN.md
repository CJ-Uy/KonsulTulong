# KonsulTulong v2 — Master Plan

**Status:** Locked, ready for implementation
**Last updated:** 2026-05-19
**Scope:** Full rebuild on Cloudflare stack with rebuilt dynamic forms, kiosk-friendly UX, risk-assessment engine, and clinic queue management.

---

## 1. Product Framing

KonsulTulong v2 is a **pre-consultation triage tool**, not an EMR. The goal is to let patients fill out the standard intake questions they would already be asked anyway, *while waiting for their consultation*, so the doctor:

- Reads a one-screen summary with computed risk scores before the patient walks in.
- Spends more face time on anomalies and the chief complaint, less on rote questions.
- Sees red flags (e.g. PHQ-9 ≥ 15, suicidality on PHQ-9 Q9) before entering the room.

**Non-goals:**

- Replacing patient records / EMR.
- Longitudinal medical history.
- Insurance/billing.
- US-grade HIPAA compliance (we follow PH Data Privacy Act 2012).
- Multi-doctor clinics (v1 supports single doctor per clinic).

**Tagline:** *Walk-in to walk-up — ang katanungan, sagot na bago pumasok.*

---

## 2. Patient Flow (Canonical)

```
1. Patient arrives at clinic and talks to the secretary.
2. Secretary adds them to the queue:
     [+ Add patient] → name → next queue number assigned.
3. Secretary tells patient: "Optional — scan the QR on the wall to fill the form
   while you wait. It helps the doctor know what's wrong faster."
4. Patient scans clinic QR poster → /c/<clinic_code>
   - If they don't scan: they stay in the queue with no response attached.
     The system still works.
5. Patient consents (PH DPA screen) → enters name + birthdate + sex (+ optional phone).
6. Wizard form, one question per screen, friendly UX (see §6).
7. Submit → "Salamat! Maupo ka lang, tatawagin ka."
   - No score shown to patient.
   - Server computes risk, attaches result to response.
8. Secretary sees new response in "Incoming Responses" pane.
9. Secretary cross-checks name with queue list:
   - Drags response onto matching queue row (or clicks auto-match).
   - If no match: creates new queue entry from response, or leaves orphaned.
10. Doctor finishes consult → clicks "Done — Next".
    - Current visit marked done.
    - Next queued visit becomes "Now Serving".
    - Doctor's UI auto-jumps to that visit's response (or "No form submitted" placard).
    - Doctor can override at any time via dropdown to view any other patient.
```

---

## 3. Locked Decisions

| Decision | Choice |
|---|---|
| Cloud platform | Cloudflare Workers + D1 + R2 |
| Migration mode | Full cutover (no phased migration) |
| ORM | Drizzle (D1 adapter) |
| Auth | Better-Auth with Drizzle/D1 adapter |
| Languages | English default, Filipino + Bisaya togglable in patient UI |
| Patient login | None — name-match flow only |
| Visit code | None — patient enters name, secretary matches |
| Anonymous fills | Allowed (name-match) |
| Form builder | Rebuilt from scratch (Cascade as inspiration only) |
| Form chains | Yes — linear + branching DAG with conditional edges |
| Clinic-custom forms | Yes — plus seeded validated templates |
| Data retention | Forever (no auto-purge); per-clinic erasure-on-request tool |
| Offline mode | Required — Service Worker shell + IDB outbox queue |
| SMS notifications | Out of scope |
| PDF export | Yes (clinic QR poster A4 + future patient summary PDFs) |
| Patient sees score | No — receipt screen only |
| Patient ID fields | Name + birthdate + sex required; phone optional |
| Queue numbering | Daily reset at midnight Asia/Manila |
| Secretary sees scores | Hidden by default, click-to-expand |
| Doctor sees scores | Expanded by default |
| Done/Next button | Doctor advances queue (broadcasts to secretary live) |
| Multi-doctor per clinic | Not supported v1 (single doctor) |
| Cross-visit history | Yes, same clinic only, name + birthdate exact match |
| Auto-save partial answers | Yes, server-side after consent |
| Live queue counter on patient device | Experimental, off by default |
| Flow editor lib | `@xyflow/svelte` (svelte-flow), lazy-loaded admin-only |
| Skipped patient | Stays in queue with amber "Skipped" badge, one-click re-add |
| Clinic onboarding | Self-serve via Better-Auth signup, first user becomes admin |
| Doctor notes | Free-text textarea on visit, optional, autosave on blur |
| Bundle target — patient kiosk route | <60 kB JS gzipped |
| Bundle target — secretary/doctor route | <120 kB JS gzipped |
| Compliance posture | PH DPA 2012: consent capture + audit log + erasure tool |

---

## 4. Tech Stack

| Layer | Choice |
|---|---|
| Framework | SvelteKit 2.x with Svelte 5 |
| Runtime | Cloudflare Workers via `@sveltejs/adapter-cloudflare` |
| Compatibility | `nodejs_compat` flag |
| Database | Cloudflare D1 (SQLite) |
| ORM | Drizzle ORM with `drizzle-orm/d1` |
| Migrations | `drizzle-kit` + `wrangler d1 migrations apply` |
| File storage | Cloudflare R2 |
| Auth | Better-Auth with Drizzle/D1 adapter |
| UI primitives | Bits UI + Tailwind CSS v4 |
| Forms | Custom form engine (rebuilt) |
| Flow editor | `@xyflow/svelte`, lazy-loaded |
| Offline | Service Worker + `idb` (IndexedDB wrapper) + Background Sync |
| Real-time | Cloudflare Durable Objects + SSE (experimental live queue only) |
| Voice STT | Web Speech API (primary) + Cloudflare Workers AI Whisper (fallback) |
| TTS | Web Speech Synthesis API (primary) + optional pre-rendered audio in R2 |
| QR generation | `qrcode` (server-only, never in patient bundle) |

---

## 5. Schema (Final)

```ts
// $lib/db/schema.ts (SQLite via drizzle-orm/sqlite-core)
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

// JSON helper
export const json = <T>(name: string) =>
  text(name, { mode: "json" }).$type<T>();

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name"),
  role: text("role", { enum: ["admin", "doctor", "secretary", "unassigned"] })
    .notNull().default("unassigned"),
  clinicId: text("clinic_id").references(() => clinic.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const clinic = sqliteTable("clinic", {
  id: text("id").primaryKey(),
  code: text("code").unique().notNull(),
  name: text("name").notNull(),
  settings: json<ClinicSettings>("settings"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const template = sqliteTable("template", {
  id: text("id").primaryKey(),
  clinicId: text("clinic_id").references(() => clinic.id),
  // null clinicId = system template (PHQ-9 etc.), clonable but not editable
  isSystem: integer("is_system", { mode: "boolean" }).notNull().default(false),
  name: text("name").notNull(),
  description: text("description"),
  citation: text("citation"),
  questions: json<FormQuestion[]>("questions").notNull(),
  scoring: json<ScoringConfig>("scoring"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  assistedOnly: integer("assisted_only", { mode: "boolean" }).notNull().default(false),
  version: integer("version").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const flow = sqliteTable("flow", {
  id: text("id").primaryKey(),
  clinicId: text("clinic_id").notNull().references(() => clinic.id),
  name: text("name").notNull(),
  description: text("description"),
  rootTemplateId: text("root_template_id").notNull().references(() => template.id),
  nodes: json<FlowNode[]>("nodes").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
});

export const visit = sqliteTable("visit", {
  id: text("id").primaryKey(),
  clinicId: text("clinic_id").notNull().references(() => clinic.id),
  patientName: text("patient_name").notNull(),
  patientBirthdate: integer("patient_birthdate", { mode: "timestamp_ms" }),
  patientSex: text("patient_sex", { enum: ["M", "F", "U"] }),
  patientPhone: text("patient_phone"),
  queueNumber: integer("queue_number").notNull(),
  queueDate: text("queue_date").notNull(),  // YYYY-MM-DD Asia/Manila
  status: text("status", { enum: ["queued", "in_consult", "done", "skipped"] })
    .notNull().default("queued"),
  arrivedAt: integer("arrived_at", { mode: "timestamp_ms" }).notNull(),
  calledAt: integer("called_at", { mode: "timestamp_ms" }),
  completedAt: integer("completed_at", { mode: "timestamp_ms" }),
  doctorNotes: text("doctor_notes"),
});

export const response = sqliteTable("response", {
  id: text("id").primaryKey(),
  clinicId: text("clinic_id").notNull().references(() => clinic.id),
  templateId: text("template_id").notNull().references(() => template.id),
  templateVersion: integer("template_version").notNull(),
  flowId: text("flow_id").references(() => flow.id),
  patientName: text("patient_name").notNull(),
  patientBirthdate: integer("patient_birthdate", { mode: "timestamp_ms" }),
  patientSex: text("patient_sex", { enum: ["M", "F", "U"] }),
  patientPhone: text("patient_phone"),
  values: json<Record<string, AnswerValue>>("values").notNull(),
  score: json<ScoreResult>("score"),
  status: text("status", { enum: ["draft", "submitted"] }).notNull().default("draft"),
  visitId: text("visit_id").references(() => visit.id),
  linkedAt: integer("linked_at", { mode: "timestamp_ms" }),
  linkedBy: text("linked_by").references(() => user.id),
  startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull(),
  submittedAt: integer("submitted_at", { mode: "timestamp_ms" }),
  consentAt: integer("consent_at", { mode: "timestamp_ms" }).notNull(),
});

export const attachment = sqliteTable("attachment", {
  id: text("id").primaryKey(),
  responseId: text("response_id").references(() => response.id),
  r2Key: text("r2_key").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  uploadedAt: integer("uploaded_at", { mode: "timestamp_ms" }).notNull(),
});

export const consent = sqliteTable("consent", {
  id: text("id").primaryKey(),
  responseId: text("response_id").references(() => response.id),
  consentText: text("consent_text").notNull(),
  consentVersion: text("consent_version").notNull(),
  acceptedAt: integer("accepted_at", { mode: "timestamp_ms" }).notNull(),
  ipHash: text("ip_hash"),
});

export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  actorType: text("actor_type", {
    enum: ["patient", "doctor", "secretary", "admin", "system"],
  }).notNull(),
  actorId: text("actor_id"),
  clinicId: text("clinic_id").notNull(),
  action: text("action").notNull(),
  resourceType: text("resource_type"),
  resourceId: text("resource_id"),
  metadata: json<Record<string, unknown>>("metadata"),
  at: integer("at", { mode: "timestamp_ms" }).notNull(),
});

// Better-Auth tables (session, account, verification) generated via @better-auth/cli
```

**Indexes:**

- `visit(clinicId, queueDate, queueNumber)` — fast daily queue fetch.
- `response(clinicId, visitId)` — current-patient responses lookup.
- `response(clinicId, submittedAt) WHERE visit_id IS NULL` — unmatched response feed.
- `response(clinicId, patientName, patientBirthdate)` — cross-visit history.
- `auditLog(clinicId, at)` — audit queries.

---

## 6. Form Engine

### 6.1 Field types

```ts
type FieldType =
  | "short_text" | "long_text" | "number"
  | "date" | "birthdate" | "age"
  | "single_choice" | "multi_choice"
  | "scale_1_10" | "pain_face" | "body_diagram"
  | "yes_no" | "blood_pressure" | "weight_height"
  | "file_upload" | "signature"
  | "section_header" | "info_card"
  | "repeater";
```

### 6.2 Question schema

```ts
interface FormQuestion {
  id: string;
  type: FieldType;
  label: string;
  labelTranslations?: { "fil-PH"?: string; "ceb-PH"?: string; "en-PH"?: string };
  help?: string;
  helpAudioKey?: string;
  icon?: string;
  required?: boolean;
  options?: { value: string; label: string; icon?: string; image?: string }[];
  min?: number; max?: number; step?: number; unit?: string;
  displayLogic?: DisplayLogic;
  scoring?: QuestionScoring;
  validation?: { regex?: string; message?: string };
}

interface DisplayLogic {
  triggerQuestionId?: string;
  operator?: "equals" | "notEquals" | "greaterThan" | "lessThan" | "ageGreaterThan";
  value?: string | number | boolean;
  condition?: "AND" | "OR";
  rules?: DisplayLogicRule[];
}
```

### 6.3 Three render modes, one schema

| Mode | Audience | Surface |
|---|---|---|
| **Builder** | doctor/admin | drag-drop, all field types, conditional logic editor |
| **Kiosk** | patient via QR | one Q per screen, big buttons, voice + TTS, EN/FIL/CEB toggle |
| **Compact** | secretary fill-on-behalf | dense single-page form, keyboard nav |

Template `defaultMode` + URL override `?mode=` chooses surface.

### 6.4 Form chains (flow DAG)

```ts
interface FlowNode {
  templateId: string;
  next: FlowEdge[];
}
interface FlowEdge {
  toTemplateId: string;
  condition?: DisplayLogic;
  label?: string;
}
```

Evaluator picks next template by evaluating edge conditions against completed responses *and* visit demographics (age computed from birthdate).

Three flow modes for clinics:

1. **Single form** — one template, done.
2. **Linear chain** — fixed sequence.
3. **Branching DAG** — conditional next-template selection. Example:

```
[Intake] →
  age <18  → [Pediatric history]
  age 18-65 → [Adult intake + PHQ-2]
                ↓ PHQ-2 ≥3
              [PHQ-9]
  age >65  → [Senior intake + Mini-Cog (assisted)]
```

### 6.5 Versioning

Each save bumps `template.version`. Responses stamp `templateVersion` at start. Templates become immutable after first response submitted unless cloned to new version.

---

## 7. Kiosk UX (Digital-Illiterate Friendly)

### 7.1 Layout principles

- One question per screen.
- 24–32pt question text.
- Tap targets ≥ 44×44pt (Apple HIG minimum), prefer 64×64.
- Every question has icon + 🔊 audio button.
- Color semantics consistent: green=yes/safe, red=no/danger, blue=neutral.
- No system keyboard for numbers — custom huge digit keypad.
- Confirmation echo screen before submit: "Tama ba ito? [Yes/Edit]".
- Idle 60s → "Need help? Press for staff" + reset countdown.
- Short haptic-style click sound on every button tap.

### 7.2 Components

| Component | Purpose |
|---|---|
| `KioskShell.svelte` | progress dots, back/next, language switcher, idle reset |
| `KioskQuestionView.svelte` | renders one question, dispatches to field component |
| `KioskYesNo.svelte` | giant 👍/👎 cards |
| `KioskChoice.svelte` | option cards with icons/images, single or multi |
| `KioskScale.svelte` | Wong-Baker pain face scale 0–10 |
| `KioskBodyDiagram.svelte` | tap-to-mark front/back silhouette (SVG, multi-region) |
| `KioskNumber.svelte` | huge digit keypad |
| `KioskText.svelte` | text input with 🎤 voice button |
| `KioskBP.svelte` | stacked digit wheels (systolic/diastolic) |
| `KioskDate.svelte` | spin-wheel day/month/year |
| `VoiceInput.svelte` | Web Speech API push-to-talk |
| `TTSButton.svelte` | speaks question via SpeechSynthesis or R2 audio |

### 7.3 Voice & TTS

- **STT primary:** Web Speech API with `lang` set to `fil-PH` / `ceb-PH` / `en-PH`.
- **STT fallback:** `MediaRecorder` → POST to Worker → Cloudflare Workers AI `@cf/openai/whisper`.
- **TTS primary:** `SpeechSynthesisUtterance` with matching `lang`.
- **TTS optional precompute:** at template-save time, pre-render audio via Workers AI MeloTTS, store in R2, reference via `helpAudioKey` for consistent voice.

### 7.4 Language strategy

- Default English. Toggle (🌐 EN / FIL / CEB) in top-right of kiosk shell.
- UI strings: JSON bundles per lang. EN inlined. FIL/CEB lazy-loaded on toggle.
- Question labels: `labelTranslations` on each `FormQuestion`. Builder surfaces translation gaps.
- Toggle persists per device in `localStorage`.

---

## 8. Risk Assessment Engine

### 8.1 Scoring config

```ts
interface ScoringConfig {
  algorithm: "additive" | "framingham" | "phq9" | "gad7" | "findrisc"
           | "audit_c" | "epworth" | "stop_bang" | "wells_dvt"
           | "cha2ds2_vasc" | "mini_cog" | "custom";
  resultBands: {
    min: number;
    max: number;
    label: string;
    severity: "low" | "moderate" | "high" | "very_high";
    advice: string;
    color: string;
  }[];
  customFormula?: string;
}

interface QuestionScoring {
  optionPoints?: Record<string, number>;
  coefficient?: number;
  buckets?: { min: number; max: number; points: number }[];
}
```

### 8.2 Engine

`$lib/forms/scoring.ts` exports a pure `scoreResponse(template, values)` function. Server-side on submit (source of truth). Optionally re-run client-side for live preview (admin builder only — patient never sees score).

### 8.3 Bundled risk templates (system, clonable)

| Template | Domain | Source | Note |
|---|---|---|---|
| **PHQ-9** | Depression screening | Kroenke K et al. *J Gen Intern Med* 2001;16(9):606-13 | Public domain. Q9 = suicidality red flag. |
| **PHQ-2** | Brief depression pre-screen | Kroenke K et al. *Med Care* 2003;41:1284-92 | Public domain. |
| **GAD-7** | Generalized anxiety | Spitzer RL et al. *Arch Intern Med* 2006;166(10):1092-7 | Free clinical use. |
| **FINDRISC** | Type-2 diabetes 10yr risk | Lindström J, Tuomilehto J. *Diabetes Care* 2003;26(3):725-31 | Free with attribution. |
| **AUDIT-C** | Alcohol use | Bush K et al. *Arch Intern Med* 1998;158:1789-95 | WHO instrument. |
| **Epworth Sleepiness Scale** | Daytime sleepiness | Johns MW. *Sleep* 1991;14(6):540-5 | Free clinical use. |
| **STOP-BANG** | OSA risk | Chung F et al. *Anesthesiology* 2008;108(5):812-21 | Free clinical use. |
| **Wells Score (DVT)** | DVT pretest probability | Wells PS et al. *Lancet* 1997;350:1795-8 | Free. |
| **CHA₂DS₂-VASc** | AFib stroke risk | Lip GY et al. *Chest* 2010;137(2):263-72 | Free. |
| **Framingham 10yr CVD** | Cardiovascular risk | D'Agostino RB et al. *Circulation* 2008;117:743-53 | Public coefficients. |
| **Mini-Cog** | Cognitive screen | Borson S et al. *Int J Geriatr Psychiatry* 2000;15(11):1021-7 | Free. `assistedOnly: true`. |
| **Patient intake (custom)** | Demographics + chief complaint + allergies + meds | KonsulTulong-designed | Customizable starter. |

**Excluded for licensing:** MMSE (PAR Inc.-owned), Hamilton scales. Use Mini-Cog instead of MMSE.

### 8.4 Assisted-only templates (Mini-Cog)

Mini-Cog requires examiner: 3-word recall (must be spoken, not read) + clock-drawing test (paper + visual scoring). Cannot be done unsupervised by patient. Template flag `assistedOnly: true` hides it from kiosk, surfaces it only in secretary's "Fill on behalf" view with on-screen script.

### 8.5 Result presentation

- **Patient:** never sees score. Receipt screen only.
- **Doctor:** score expanded by default with severity band + advice text + breakdown.
- **Secretary:** scores hidden by default, click-to-expand. Severity badge color visible (🔴🟡) for queue prioritization.
- **Red-flag rule:** any `severity: very_high` → red banner on doctor view, flagged in queue.

---

## 9. Cloudflare Migration

### 9.1 Adapter

```bash
npm uninstall @sveltejs/adapter-node
npm install -D @sveltejs/adapter-cloudflare
```

### 9.2 `wrangler.toml`

```toml
name = "konsultulong"
main = ".svelte-kit/cloudflare/_worker.js"
compatibility_date = "2026-05-01"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "konsultulong"
database_id = "<filled after wrangler d1 create>"

[[r2_buckets]]
binding = "R2"
bucket_name = "konsultulong-files"

[[durable_objects.bindings]]
name = "QUEUE_DO"
class_name = "QueueDO"

[vars]
PUBLIC_BETTER_AUTH_URL = "https://konsultulong.workers.dev"

# secrets: wrangler secret put BETTER_AUTH_SECRET
```

### 9.3 DB client (SvelteKit-shaped)

```ts
// $lib/db/index.ts
import { drizzle } from "drizzle-orm/d1";
import { drizzle as drizzleProxy } from "drizzle-orm/sqlite-proxy";
import * as schema from "./schema";

export type DB = ReturnType<typeof drizzle<typeof schema>>;

export function getDb(platform: App.Platform | undefined): DB {
  const d1 = platform?.env?.DB;
  if (d1) return drizzle(d1, { schema });

  // dev fallback via D1 HTTP REST API
  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_D1_TOKEN } = process.env;
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_D1_DATABASE_ID || !CLOUDFLARE_D1_TOKEN) {
    throw new Error("No D1 binding and no HTTP fallback envs set");
  }

  return drizzleProxy(async (sql, params, method) => {
    const r = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${CLOUDFLARE_D1_DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_D1_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql, params }),
      },
    );
    const data = (await r.json()) as any;
    if (!data.success) throw new Error(data.errors?.[0]?.message ?? "D1 error");
    if (method === "run") return { rows: [] };
    const results = data.result?.[0]?.results ?? [];
    if (!results.length) return { rows: [] };
    const cols = Object.keys(results[0]);
    const rows = results.map((r: any) => cols.map((c) => r[c]));
    return { rows: method === "get" ? rows[0] : rows };
  }, { schema }) as unknown as DB;
}
```

### 9.4 Hooks

```ts
// src/hooks.server.ts
import { getDb } from "$lib/db";

export const handle = async ({ event, resolve }) => {
  event.locals.db = getDb(event.platform);
  // ... Better-Auth handler chains here
  return resolve(event);
};
```

### 9.5 R2 file pipeline

Direct upload to Worker for files <100MB (clinic use case is photos/PDFs, all small):

```ts
// src/routes/api/upload/+server.ts
export const POST = async ({ request, platform, locals }) => {
  const form = await request.formData();
  const file = form.get("file") as File;
  const key = `${crypto.randomUUID()}-${file.name}`;
  await platform!.env.R2.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });
  return new Response(JSON.stringify({ key }));
};
```

### 9.6 Auth migration

Better-Auth Drizzle adapter pointed at D1. Generate session/account/verification tables via `npx @better-auth/cli generate`. No route code changes.

### 9.7 What dies

- `pg`/`postgres-js` imports.
- MinIO SDK.
- `adapter-node`.
- `npm run db:populate` (replaced by `wrangler d1 execute --file seed.sql`).
- All JSONB-specific queries.
- Anything that touched Postgres connection pooling.

---

## 10. Offline Mode

### 10.1 Layer A — Service Worker shell cache

- Cache `/c/<code>` route HTML + JS bundles + CSS + fonts + inline SVG icons on first online visit.
- App boots fully offline after that.

### 10.2 Layer B — Template cache (IndexedDB)

- Server returns active templates JSON on clinic landing fetch.
- Cache in IDB keyed by `clinicId:templateId:version`.
- Etag-based revalidation when online.

### 10.3 Layer C — Response queue (outbox)

- Submit (and partial auto-save) writes to IDB `outbox` store.
- Background Sync API drains outbox → POST to Worker.
- Worker upserts responses by client-minted UUID (idempotent).
- Patient sees instant "Salamat!" receipt; sync happens transparently.
- R2 file uploads queued the same way: blob in IDB, drained on reconnect.

### 10.4 Conflict policy

Responses are append-only. No conflict possible. Worker rejects only on schema version mismatch (rare); UI prompts retry with current template.

### 10.5 Libraries

- `idb` (~3kb gzip) — IndexedDB wrapper.
- Custom Background Sync handler (~150 LOC). Skip Workbox (overkill, +20kb).

---

## 11. Secretary UI

Route: `/dashboard/queue` (default for `secretary` role).

### 11.1 Layout

```
┌─ QUEUE ──────────────────────┬─ INCOMING RESPONSES ──────────┐
│ NOW: #4 Juan Cruz            │ (unmatched, newest first)     │
│                              │                               │
│ #5 ☐ Maria Santos    10:32  │ Maria Santos        10:38 [→] │
│ #6 ☐ Pedro Reyes     10:38  │   PHQ-9, GAD-7                │
│ #7 ☐ Ana Lim         10:45  │                               │
│ #8 ☐ Maria Santos    10:52  │ Jose dela Cruz      10:42 [→] │
│ #9 ☐ Carlos Mendoza  11:01  │   Intake                      │
│                              │                               │
│ [+ Add patient]              │ [⚠ Orphans (2)]              │
│ [⇅ Reorder]                  │                               │
└──────────────────────────────┴───────────────────────────────┘
```

### 11.2 Features

- Live updates via SSE on visit + response state changes.
- Daily reset at midnight Asia/Manila — queue numbers restart at #1.
- Drag-and-drop response onto queue row to link.
- Auto-match toggle: fuzzy name match (Levenshtein ≤2) within 1hr arrival window; secretary confirms.
- Disambiguation picker for duplicate names: shows queue#, arrival, birthdate.
- Walk-in manual add: type name → next queue number.
- Reorder via drag handles.
- Skip button → amber badge, stays visible, one-click re-add.
- Scores hidden by default (click to expand).

### 11.3 Components

| Component | Purpose |
|---|---|
| `QueueTable.svelte` | virtualized list, SSE-updated |
| `QueueRow.svelte` | drag handle, status badges, actions |
| `NowServing.svelte` | top banner |
| `IncomingResponses.svelte` | unmatched response feed |
| `MatchPicker.svelte` | disambiguation dialog |
| `ManualEntryDialog.svelte` | walk-in form |
| `ResponseDrawer.svelte` | side panel detail |

---

## 12. Doctor UI

Route: `/dashboard/consult` (default for `doctor` role).

### 12.1 Layout

```
┌────────────────────────────────────────────────┐
│ NOW SERVING (queue):  #7  Maria Santos         │
│ VIEWING:              #7  Maria Santos    [▾]  │
├────────────────────────────────────────────────┤
│ Forms submitted: PHQ-9, GAD-7                  │
│ ┌─ PHQ-9 ─────────────────────────  Score: 14 │
│ │  Moderate. Consider counseling.            │
│ │  [breakdown ▾]                             │
│ └────────────────────────────────────────────┘
│ ┌─ GAD-7 ─────────────────────────  Score: 8 │
│ │  Mild anxiety.                             │
│ └────────────────────────────────────────────┘
│                                                │
│ History (same name + birthdate):               │
│   • 2026-04-12 PHQ-9: 12 (mild)               │
│   • 2026-03-04 PHQ-9: 9 (mild)                │
│                                                │
│ Notes: [autosave free-text textarea]          │
│                                                │
│ [✓ Done — Next]      [← Back to queue]        │
└────────────────────────────────────────────────┘
```

### 12.2 Two-pointer system

- **Now Serving** (shared, queue-driven): updated by doctor's "Done — Next" advance.
- **Viewing** (doctor-local): independently changes via dropdown to inspect any visit. Returns to Now Serving when doctor hits "Sync" or "Done — Next".

### 12.3 No-form-submitted placard

```
┌─────────────────────────────────────────┐
│         📋  No form submitted          │
│                                         │
│   Maria Santos · F · age 34            │
│   Arrived 10:32                        │
│                                         │
│   [+ Fill on behalf]  [✓ Done — Next] │
└─────────────────────────────────────────┘
```

### 12.4 Cross-visit history

Same-clinic + exact-match (case-insensitive, whitespace-normalized) `patientName` + `patientBirthdate`. Surfaces last 10 prior responses for trending.

---

## 13. A4 Clinic QR Poster Generator

Route: `/dashboard/settings/poster`.

- Admin sees A4 print preview: clinic name, optional logo, big QR (encodes `https://konsultulong.workers.dev/c/<clinic_code>`), instructions in EN/FIL/CEB.
- Customizable: clinic name override, logo upload (to R2), tagline.
- Download as PDF via browser print + CSS `@page` (zero extra cost) or PNG via canvas serialization.
- QR generated server-side with `qrcode` lib — never shipped to patient bundle.

---

## 14. Experimental Live Queue Counter

Feature-flagged per clinic (`clinic.settings.experimentalLiveQueue`, default false).

### 14.1 Architecture

- Cloudflare Durable Object `QueueDO`, one per clinic.
- Holds `{ nowServing, queue }` in memory, persists snapshots to D1 on state change.
- Endpoints:
  - `POST /api/queue/<clinicId>/advance` — doctor or secretary action, mutates state, broadcasts.
  - `GET /api/queue/<clinicId>/stream` — SSE subscriber endpoint.

### 14.2 Patient UI (post-submit, opt-in only)

```
✓ Tapos ka na, Maria!

Numero mo:    #7
Tinatawag na: #4

[auto-refresh, no manual reload]
"Mga numero, gabay lang. Pakikiramdaman din ang tawag ng secretary."
```

When patient's number = now serving, screen flashes + chime + "🔔 IKAW NA!".

### 14.3 Why experimental

- Stale state risk if device sleeps / tab loses focus.
- Doctor jumps order or secretary inserts urgent walk-ins — patient may misread.
- Banner + 10s refetch + tab-focus refetch mitigate but don't eliminate.

---

## 15. Compliance (PH DPA 2012)

- **Consent capture:** every response begins with a consent screen. Exact text + version hashed and stored in `consent` table.
- **Audit log:** every doctor/secretary action on a response (view, link, edit notes, erase) writes an `audit_log` row.
- **Erasure on request:** clinic admin tool — search by name → confirm → cascade delete response + attachments + visit link, write `patient.erasure_request` audit row.
- **Retention:** indefinite by default, configurable per clinic. Audit log retained for 1 year minimum then optionally compacted.
- **Encryption:** D1 and R2 encrypt at rest by default (Cloudflare infra). HSTS header enforced on Worker.
- **Data export:** clinic admin can export all responses for a patient name match as PDF + JSON bundle.

---

## 16. Bundle-Size Strategy

Hard constraint: app must work on poor connections.

| Route | Target gzip JS | Strategy |
|---|---|---|
| `/c/<code>` (kiosk) | <60 kB | Inline SVG icons, no Drizzle client, no svelte-flow, no qrcode lib, lazy lang bundles, native Intl for dates |
| `/dashboard/queue` (secretary) | <120 kB | Bits UI tree-shake, no flow editor |
| `/dashboard/consult` (doctor) | <120 kB | + scoring engine (all algorithms) |
| `/dashboard/flows` (admin) | unbounded | svelte-flow lazy-loaded here only |
| `/dashboard/forms` (admin) | <200 kB | Builder + dnd lib |

Techniques:

- SvelteKit per-route code splitting (default — verify no admin code leaks).
- Dynamic import for `@xyflow/svelte`.
- Lucide icons: inline SVG `.svelte` components on kiosk; tree-shaken imports elsewhere.
- Bits UI per-component imports.
- No date lib — use `Intl.DateTimeFormat` + `Intl.RelativeTimeFormat`.
- Lang JSON bundles lazy-loaded (EN inlined as fallback).
- No Sentry/analytics until phase 17, then lazy-loaded.
- No `svelte/transition` runtime on kiosk — pure CSS animations.
- Service Worker cache-first after first load.

CI check at deploy time: parse build report, fail if kiosk route >70 kB.

---

## 17. Implementation Phases

| Phase | Deliverable | Days |
|---|---|---|
| 1 | Cloudflare scaffold: adapter, wrangler.toml, D1 + R2 created, blank app boots in `wrangler dev` | 1 |
| 2 | Schema (visit + response + flow + template + audit + consent + clinic + user + attachment) + Better-Auth on D1 + login working | 2 |
| 3 | R2 file pipeline (upload, fetch, delete) | 1 |
| 4 | Public landing `/c/<code>` + clinic code resolution + name entry | 1 |
| 5 | Secretary queue UI v1: queue list, manual add, reorder, name-match incoming pane | 3 |
| 6 | Compact-mode form renderer (secretary fill-on-behalf) | 2 |
| 7 | Builder UI rebuild (templates) | 3 |
| 7.3 | Flow builder (svelte-flow lazy-loaded) | 2 |
| 7.5 | Offline: Service Worker shell + IDB outbox + Background Sync (patient bundle only) | 3 |
| 8 | Kiosk shell + 4 core fields (YesNo, Choice, Number, Text+voice), bundle-budgeted | 3 |
| 9 | Voice + TTS (EN default, FIL/CEB lazy bundles) | 1 |
| 10 | Specialty kiosk fields (pain face, body diagram, BP, scale) | 2 |
| 11 | Scoring engine + 4 starter risk templates (PHQ-9, GAD-7, FINDRISC, AUDIT-C) | 2 |
| 12 | Doctor consult view (two-pointer auto-track + override + "Done — Next") | 2 |
| 13 | Consent capture + audit log + erasure tool | 1 |
| 14 | A4 clinic QR poster generator | 1 |
| 15 | Experimental live queue (Durable Object + SSE, opt-in flag) | 2 |
| 16 | Remaining risk templates (PHQ-2, Epworth, STOP-BANG, Wells, CHA₂DS₂-VASc, Framingham, Mini-Cog) + citation page + assisted-mode rendering | 2 |
| 17 | i18n EN/FIL/CEB, idle reset, receipt + QR print, bundle audit, deploy | 2 |

**Total estimate:** ~34 working days solo.

---

## 18. Things Out of Scope (v1)

- Multi-doctor per clinic.
- SMS / WhatsApp notifications.
- US-grade HIPAA compliance.
- Patient login / patient accounts.
- Longitudinal medical record / EMR features.
- Insurance / billing.
- Appointment scheduling.
- Telemedicine / video consults.
- Lab result ingestion.
- Cross-clinic data sharing.
- Patient-facing score display.
- Auto-purge / data lifecycle automation (manual erasure tool only).
- Thermal receipt printer hardware support.

---

## 19. Open / Default Decisions Worth Revisiting Later

- Auto-purge cron job (if storage costs grow).
- Multi-doctor support.
- SMS recall via Twilio/Semaphore.
- Cross-clinic patient code portability.
- Patient-facing wellness templates that *do* show score (e.g. sleep tracker).
- Native mobile app vs. PWA-only.
