import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { template } from "$lib/db/schema";
import { ALL_RISK_TEMPLATES } from "$lib/forms/risk-templates";
import { uuid } from "$lib/utils/ids";
import { requireRole } from "$lib/server/clinic-context";
import type { RequestHandler } from "./$types";

/**
 * Installs the bundled validated risk templates (PHQ-9, PHQ-2, GAD-7, AUDIT-C)
 * into the current clinic as inactive copies that the admin can review, edit,
 * and toggle on. Idempotent: running it again skips templates whose name is
 * already present in the clinic.
 */
export const POST: RequestHandler = async ({ locals }) => {
	const ctx = requireRole(locals, ["admin", "doctor"]);

	const existing = await locals.db
		.select({ name: template.name })
		.from(template)
		.where(eq(template.clinicId, ctx.clinicId));
	const existingNames = new Set(existing.map((r) => r.name.toLowerCase()));

	const inserted: { name: string; id: string }[] = [];
	for (const seed of ALL_RISK_TEMPLATES) {
		if (existingNames.has(seed.name.toLowerCase())) continue;
		const id = uuid();
		await locals.db.insert(template).values({
			id,
			clinicId: ctx.clinicId,
			isSystem: false,
			name: seed.name,
			description: seed.description,
			citation: seed.citation,
			questions: seed.questions,
			scoring: seed.scoring,
			isActive: false,
			assistedOnly: seed.assistedOnly === true,
			version: 1
		});
		inserted.push({ name: seed.name, id });
	}

	return json({ inserted });
};
