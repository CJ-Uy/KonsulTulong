import { error } from "@sveltejs/kit";
import { getAttachment, deleteAttachment } from "$lib/storage/r2";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, locals, platform }) => {
	if (!platform?.env?.R2) throw error(500, "R2 binding unavailable");

	const result = await getAttachment(platform.env.R2, locals.db, params.id);
	if (!result) throw error(404, "File not found");

	const headers = new Headers();
	headers.set("Content-Type", result.mime || "application/octet-stream");
	headers.set("Cache-Control", "private, max-age=3600");
	if (result.originalName) {
		headers.set(
			"Content-Disposition",
			`inline; filename="${result.originalName.replace(/"/g, "")}"`
		);
	}
	return new Response(result.object.body, { headers });
};

export const DELETE: RequestHandler = async ({ params, locals, platform }) => {
	if (!locals.user) throw error(401, "Not authenticated");
	if (!platform?.env?.R2) throw error(500, "R2 binding unavailable");

	await deleteAttachment(platform.env.R2, locals.db, params.id);
	return new Response(null, { status: 204 });
};
