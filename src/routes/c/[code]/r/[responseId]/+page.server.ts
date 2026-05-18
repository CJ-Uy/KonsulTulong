import { error } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { clinic, template, response } from "$lib/db/schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
	const code = params.code.toUpperCase();
	const clinicRows = await locals.db
		.select({ id: clinic.id, code: clinic.code, name: clinic.name, settings: clinic.settings })
		.from(clinic)
		.where(eq(clinic.code, code))
		.limit(1);
	if (clinicRows.length === 0) throw error(404, "Clinic not found");

	const resRows = await locals.db
		.select()
		.from(response)
		.where(and(eq(response.id, params.responseId), eq(response.clinicId, clinicRows[0].id)))
		.limit(1);
	if (resRows.length === 0) throw error(404, "Response not found");

	const tmplRows = await locals.db
		.select()
		.from(template)
		.where(eq(template.id, resRows[0].templateId))
		.limit(1);
	if (tmplRows.length === 0) throw error(404, "Template gone");

	return {
		clinic: clinicRows[0],
		response: resRows[0],
		template: tmplRows[0]
	};
};
