# CLAUDE.md - KonsulTulong Project Guide

This document provides guidance for Claude (AI assistant) when working on this codebase.

## Project Overview

**KonsulTulong** is a medical consultation management system built with SvelteKit. It enables clinics and doctors to manage patient consultations through customizable dynamic forms.

### Tech Stack

- **Framework**: SvelteKit 2.x with Svelte 5
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Drizzle ORM
- **UI Library**: Bits UI (SvelteKit port of shadcn/ui)
- **Styling**: Tailwind CSS 4.0
- **Authentication**: Better-Auth
- **File Storage**: MinIO (S3-compatible)
- **Forms**: sveltekit-superforms + formsnap for validation

## Project Structure

```
src/
├── routes/
│   ├── (app)/                    # Protected routes (requires auth)
│   │   └── dashboard/
│   │       ├── +page.svelte      # Main dashboard
│   │       ├── forms/            # Dynamic Forms Builder
│   │       │   ├── +page.svelte  # Form templates list
│   │       │   └── [id]/
│   │       │       ├── edit/     # Form editor
│   │       │       └── preview/  # Form preview
│   │       └── ...
│   └── (public)/                 # Public routes
│       ├── clinic/[clinic_code]/ # Public form submission
│       └── ...
├── lib/
│   ├── components/
│   │   ├── forms/               # Dynamic Forms components
│   │   │   ├── FormBuilder.svelte
│   │   │   ├── FormFiller.svelte
│   │   │   ├── FieldRenderer.svelte
│   │   │   └── ...
│   │   └── ui/                  # UI components (Bits UI)
│   ├── db/
│   │   ├── schema.ts            # Drizzle ORM schema
│   │   └── index.ts             # Database connection
│   ├── forms/
│   │   ├── actions.ts           # Server actions for forms
│   │   └── validation.ts        # Form validation logic
│   ├── types/
│   │   └── forms.ts             # TypeScript types for forms
│   ├── auth.ts                  # Better-Auth config
│   └── utils.ts                 # Utility functions
└── hooks.server.ts              # Server hooks (auth guards)
```

## Key Patterns & Conventions

### Component Patterns

1. **Svelte 5 Runes**: Use `$state`, `$derived`, `$effect`, and `$props` for reactivity
2. **Props**: Always type props with interfaces
3. **Component Files**: Use `.svelte` extension, PascalCase naming

```svelte
<script lang="ts">
	interface Props {
		value: string;
		onChange: (value: string) => void;
	}

	let { value, onChange }: Props = $props();
</script>
```

### Database Operations

Use Drizzle ORM for all database operations:

```typescript
import { db } from "$lib/db";
import { template } from "$lib/db/schema";
import { eq } from "drizzle-orm";

// Query
const results = await db.select().from(template).where(eq(template.id, id));

// Insert
await db.insert(template).values({ name, questions });

// Update
await db.update(template).set({ name }).where(eq(template.id, id));
```

### UI Components

Import from `$lib/components/ui/`:

```svelte
<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import * as Card from "$lib/components/ui/card";
	import * as Dialog from "$lib/components/ui/dialog";
</script>
```

### Form Handling

For complex forms, use sveltekit-superforms:

```svelte
<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import { zod } from "sveltekit-superforms/adapters";
	import { schema } from "./schema";

	const form = superForm(data.form, {
		validators: zod(schema)
	});
</script>
```

## Dynamic Forms System

### Overview

The Dynamic Forms System allows clinics to create custom forms without code changes:

1. **Form Builder** (`FormBuilder.svelte`): Drag-and-drop form creation UI
2. **Form Filler** (`FormFiller.svelte`): Renders forms for user submission
3. **Validation** (`validation.ts`): Client/server validation with display logic

### Field Types

Supported field types (see `$lib/types/forms.ts`):

- `short_answer` - Single-line text
- `long_text` - Multi-line textarea
- `number` - Numeric input with validation
- `date` - Date picker
- `multiple_choice` - Radio buttons (single select)
- `checkbox` - Checkboxes (multi-select)
- `select` - Dropdown
- `boolean` - Yes/No
- `file_upload` - File attachment
- `section_header` - Visual separator
- `repeater` - Repeating row groups

### Display Logic

Fields can have conditional visibility based on other field values:

```typescript
interface DisplayLogic {
	triggerQuestionId?: string;
	operator?: "equals" | "notEquals" | "greaterThan" | "lessThan" | "ageGreaterThan";
	value?: string | number | boolean;
	// Compound logic
	condition?: "AND" | "OR";
	rules?: DisplayLogicRule[];
}
```

### Creating a New Field Type

1. Add type to `FieldType` in `$lib/types/forms.ts`
2. Add to `FIELD_TYPE_OPTIONS` array
3. Update `createDefaultField()` function
4. Add renderer in `FieldRenderer.svelte`
5. Add editor UI in `FieldEditor.svelte` (if needed)
6. Update validation in `$lib/forms/validation.ts`

## Database Schema

### Key Tables

| Table      | Purpose                          |
| ---------- | -------------------------------- |
| `user`     | User accounts with roles         |
| `clinic`   | Medical clinics                  |
| `template` | Form templates (JSONB questions) |
| `response` | Form submissions (JSONB values)  |
| `session`  | Auth sessions                    |

### User Roles

- `admin` - Full system access
- `doctor` - Clinic management
- `secretary` - Basic operations
- `unassigned` - New users

## Development Commands

```bash
# Development
npm run dev

# Database
npm run db:push          # Push schema changes
npm run db:studio        # Open Drizzle Studio
npm run db:generate      # Generate migrations
npm run db:populate      # Seed sample data

# Build
npm run build
npm run preview

# Linting
npm run lint
npm run format
```

## Authentication

Protected routes are guarded in `hooks.server.ts`. Use the security handler:

```typescript
import { securityHandler } from "$lib/security";

export const load = async (event) => {
	const security = securityHandler(event);
	security.requireAuth(); // Throws 401 if not authenticated

	const user = security.getUser();
	// ...
};
```

## Environment Variables

Required environment variables:

```env
DATABASE_URL=postgresql://...
PUBLIC_BETTER_AUTH_URL=http://localhost:5173
MINIO_ENDPOINT=...
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
```

## Common Tasks

### Adding a New Dashboard Page

1. Create route in `src/routes/(app)/dashboard/[page-name]/`
2. Add `+page.svelte` for UI
3. Add `+page.server.ts` for data loading
4. Add navigation link in `app-sidebar.svelte`

### Working with Forms

```typescript
// Server: Get templates
import { getClinicTemplates } from "$lib/forms/actions";
const templates = await getClinicTemplates(clinicId);

// Server: Submit form
import { submitFormResponse } from "$lib/forms/actions";
await submitFormResponse({ templateId, clinicId, values });

// Client: Validate form
import { validateForm } from "$lib/forms/validation";
const result = validateForm(fields, formData);
```

### Adding UI Components

Use Bits UI components from `$lib/components/ui/`. See existing components for patterns.

## Code Style

- Use TypeScript strict mode
- Prefer `$state` and `$derived` over stores
- Use named exports for utilities
- Keep components focused and small
- Use Tailwind CSS for styling
- Follow existing file naming conventions

## Testing

Currently no automated tests. Manual testing recommended:

1. Test form builder with all field types
2. Test conditional display logic
3. Test form submission flow
4. Test authentication guards
5. Test mobile responsiveness

## Deployment

Uses `@sveltejs/adapter-node`. Build outputs to `build/` directory.

```bash
npm run build
node build
```

## Troubleshooting

### Common Issues

1. **Database connection errors**: Check `DATABASE_URL` env var
2. **Auth issues**: Verify Better-Auth configuration
3. **Form validation**: Check browser console for validation errors
4. **Styling issues**: Ensure Tailwind classes are correct

### Debug Tips

- Use `console.log` in `+page.server.ts` for server debugging
- Check Network tab for API errors
- Use Drizzle Studio for database inspection
