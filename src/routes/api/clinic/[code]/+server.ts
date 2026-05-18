import { json, error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { clinic } from "$lib/db/schema";
import type { RequestHandler } from "./$types";

/**
 * Resolves a clinic code to its public metadata. Used by the landing page to
 * verify the code before redirecting the patient to `/c/<code>`.
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	const code = params.code?.toUpperCase();
	if (!code) throw error(400, "Code required");

	const rows = await locals.db
		.select({ id: clinic.id, code: clinic.code, name: clinic.name })
		.from(clinic)
		.where(eq(clinic.code, code))
		.limit(1);

	if (rows.length === 0) throw error(404, "Clinic not found");
	return json(rows[0]);
};
