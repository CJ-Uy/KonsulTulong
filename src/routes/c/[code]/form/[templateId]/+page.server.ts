import { error } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { clinic, template } from "$lib/db/schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
	const code = params.code.toUpperCase();
	const clinicRows = await locals.db
		.select({ id: clinic.id, code: clinic.code, name: clinic.name, settings: clinic.settings })
		.from(clinic)
		.where(eq(clinic.code, code))
		.limit(1);
	if (clinicRows.length === 0) throw error(404, "Clinic not found");

	const tmplRows = await locals.db
		.select({
			id: template.id,
			name: template.name,
			description: template.description,
			isActive: template.isActive,
			assistedOnly: template.assistedOnly
		})
		.from(template)
		.where(and(eq(template.id, params.templateId), eq(template.clinicId, clinicRows[0].id)))
		.limit(1);
	if (tmplRows.length === 0 || !tmplRows[0].isActive) throw error(404, "Form not available");
	if (tmplRows[0].assistedOnly) throw error(403, "This form is filled by staff only");

	return { clinic: clinicRows[0], template: tmplRows[0] };
};
