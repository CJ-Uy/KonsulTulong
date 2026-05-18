import { error } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { clinic, template, flow } from "$lib/db/schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
	const code = params.code.toUpperCase();
	const clinicRows = await locals.db
		.select({ id: clinic.id, code: clinic.code, name: clinic.name, settings: clinic.settings })
		.from(clinic)
		.where(eq(clinic.code, code))
		.limit(1);

	if (clinicRows.length === 0) throw error(404, "Clinic not found");
	const c = clinicRows[0];

	const activeTemplates = await locals.db
		.select({
			id: template.id,
			name: template.name,
			description: template.description,
			version: template.version
		})
		.from(template)
		.where(and(eq(template.clinicId, c.id), eq(template.isActive, true)));

	const activeFlows = await locals.db
		.select({
			id: flow.id,
			name: flow.name,
			description: flow.description,
			rootTemplateId: flow.rootTemplateId,
			isDefault: flow.isDefault
		})
		.from(flow)
		.where(and(eq(flow.clinicId, c.id), eq(flow.isActive, true)));

	return { clinic: c, templates: activeTemplates, flows: activeFlows };
};
