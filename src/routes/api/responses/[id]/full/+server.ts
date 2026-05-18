import { error, json } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { response, template } from "$lib/db/schema";
import { requireRole } from "$lib/server/clinic-context";
import type { RequestHandler } from "./$types";

/**
 * Returns the response plus the template name + questions snapshot.
 * Used by the doctor view to render the question/answer pairs.
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	const ctx = requireRole(locals, ["doctor", "admin", "secretary"]);
	const rows = await locals.db
		.select({
			id: response.id,
			templateId: response.templateId,
			values: response.values,
			score: response.score,
			templateName: template.name,
			questions: template.questions
		})
		.from(response)
		.innerJoin(template, eq(template.id, response.templateId))
		.where(and(eq(response.id, params.id), eq(response.clinicId, ctx.clinicId)))
		.limit(1);

	if (rows.length === 0) throw error(404, "Response not found");
	return json(rows[0]);
};
