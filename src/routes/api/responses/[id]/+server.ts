import { error, json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { response } from "$lib/db/schema";
import type { AnswerValue } from "$lib/types";
import type { RequestHandler } from "./$types";

/**
 * Read a draft response so the kiosk can resume.
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	const rows = await locals.db
		.select()
		.from(response)
		.where(eq(response.id, params.id))
		.limit(1);
	if (rows.length === 0) throw error(404, "Response not found");
	return json(rows[0]);
};

interface PatchBody {
	values?: Record<string, AnswerValue>;
	finalize?: boolean;
}

/**
 * Autosave partial answers, or finalize the response when `finalize: true`.
 *
 * Finalization is the boundary between draft and submitted. We only score on
 * finalize; scoring partial inputs would risk surfacing intermediate severity
 * bands the patient should never see. (Scoring wired in phase 11.)
 */
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	const body = (await request.json().catch(() => null)) as PatchBody | null;
	if (!body) throw error(400, "Missing body");

	const rows = await locals.db
		.select({ status: response.status, values: response.values })
		.from(response)
		.where(eq(response.id, params.id))
		.limit(1);
	if (rows.length === 0) throw error(404, "Response not found");
	if (rows[0].status === "submitted") throw error(409, "Already submitted");

	const merged: Record<string, AnswerValue> = {
		...(rows[0].values ?? {}),
		...(body.values ?? {})
	};

	const update: Record<string, unknown> = { values: merged };
	if (body.finalize) {
		update.status = "submitted";
		update.submittedAt = new Date();
		// Scoring hook lands in phase 11.
	}

	await locals.db.update(response).set(update).where(eq(response.id, params.id));
	return json({ ok: true, submitted: body.finalize === true });
};
