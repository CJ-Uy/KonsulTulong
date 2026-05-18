import { error, json } from "@sveltejs/kit";
import { and, desc, eq } from "drizzle-orm";
import { response, template } from "$lib/db/schema";
import { requireRole } from "$lib/server/clinic-context";
import type { RequestHandler } from "./$types";

/**
 * Returns prior responses for the same patient (exact name + birthdate match)
 * scoped to the current clinic. Used by the doctor view to surface trends.
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	const ctx = requireRole(locals, ["doctor", "admin"]);
	const name = url.searchParams.get("name");
	const bd = url.searchParams.get("birthdate");
	if (!name || !bd) throw error(400, "name and birthdate required");

	const rows = await locals.db
		.select({
			id: response.id,
			templateId: response.templateId,
			templateName: template.name,
			submittedAt: response.submittedAt,
			score: response.score
		})
		.from(response)
		.innerJoin(template, eq(template.id, response.templateId))
		.where(
			and(
				eq(response.clinicId, ctx.clinicId),
				eq(response.patientName, name),
				eq(response.patientBirthdate, new Date(Number(bd))),
				eq(response.status, "submitted")
			)
		)
		.orderBy(desc(response.submittedAt))
		.limit(20);

	return json({ history: rows });
};
