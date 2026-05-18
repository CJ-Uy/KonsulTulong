import { json, error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { clinic, user } from "$lib/db/schema";
import { shortCode, uuid } from "$lib/utils/ids";
import type { RequestHandler } from "./$types";

/**
 * Provisions a new clinic for the currently authenticated user.
 *
 * Called once after registration. The signed-in user is promoted to `admin` and
 * bound to the new clinic via `user.clinicId`. Idempotent: if the user already
 * belongs to a clinic this returns 409.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, "Not authenticated");
	if (locals.user.clinicId) throw error(409, "User already belongs to a clinic");

	const body = (await request.json().catch(() => null)) as { name?: string } | null;
	if (!body?.name) throw error(400, "Clinic name is required");

	let code = shortCode(6);
	for (let attempt = 0; attempt < 5; attempt++) {
		const existing = await locals.db
			.select({ id: clinic.id })
			.from(clinic)
			.where(eq(clinic.code, code))
			.limit(1);
		if (existing.length === 0) break;
		code = shortCode(6);
	}

	const id = uuid();
	await locals.db.insert(clinic).values({ id, code, name: body.name });

	await locals.db
		.update(user)
		.set({ clinicId: id, role: "admin" })
		.where(eq(user.id, locals.user.id));

	return json({ id, code, name: body.name });
};
