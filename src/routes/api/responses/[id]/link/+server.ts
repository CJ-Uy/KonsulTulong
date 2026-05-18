import { error, json } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { response, visit } from "$lib/db/schema";
import { requireRole } from "$lib/server/clinic-context";
import type { RequestHandler } from "./$types";

interface LinkBody {
	visitId: string | null;
}

/**
 * Links or unlinks a submitted response to a visit. `null` clears the link.
 *
 * Only the secretary, doctor, or admin can do this. Patients can't.
 */
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	const ctx = requireRole(locals, ["secretary", "admin", "doctor"]);
	const body = (await request.json().catch(() => null)) as LinkBody | null;
	if (!body) throw error(400, "Missing body");

	const resRows = await locals.db
		.select({ id: response.id, clinicId: response.clinicId })
		.from(response)
		.where(eq(response.id, params.id))
		.limit(1);
	if (resRows.length === 0) throw error(404, "Response not found");
	if (resRows[0].clinicId !== ctx.clinicId) throw error(403, "Cross-clinic link denied");

	if (body.visitId) {
		const visitRows = await locals.db
			.select({ id: visit.id })
			.from(visit)
			.where(and(eq(visit.id, body.visitId), eq(visit.clinicId, ctx.clinicId)))
			.limit(1);
		if (visitRows.length === 0) throw error(404, "Visit not found");
	}

	await locals.db
		.update(response)
		.set({
			visitId: body.visitId,
			linkedAt: body.visitId ? new Date() : null,
			linkedBy: body.visitId ? ctx.userId : null
		})
		.where(eq(response.id, params.id));

	return json({ ok: true });
};
