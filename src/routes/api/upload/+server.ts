import { error, json } from "@sveltejs/kit";
import { putAttachment } from "$lib/storage/r2";
import type { RequestHandler } from "./$types";

/**
 * Multipart upload endpoint.
 *
 * Acceptable callers:
 *  - Patient kiosk during form fill — must include `responseId` so the file binds to
 *    the in-progress response.
 *  - Secretary fill-on-behalf — same shape.
 *
 * Trust will tighten once the response table validates clinicId ownership; for now
 * we accept what the caller supplies. Authenticated dashboard callers also pass
 * clinicId; in their case it's checked against the session user's clinic in a later
 * pass.
 */
export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!platform?.env?.R2) throw error(500, "R2 binding unavailable");

	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		throw error(400, "Expected multipart/form-data");
	}

	const file = form.get("file");
	if (!(file instanceof File)) throw error(400, "Missing file");

	const clinicId = form.get("clinicId");
	if (typeof clinicId !== "string" || !clinicId) throw error(400, "Missing clinicId");

	const responseIdRaw = form.get("responseId");
	const responseId = typeof responseIdRaw === "string" && responseIdRaw ? responseIdRaw : null;

	try {
		const result = await putAttachment(platform.env.R2, locals.db, {
			file,
			clinicId,
			responseId
		});
		return json(result);
	} catch (e) {
		const msg = e instanceof Error ? e.message : "Upload failed";
		throw error(400, msg);
	}
};
