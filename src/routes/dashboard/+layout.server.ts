import { redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { clinic } from "$lib/db/schema";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, "/login");

	let clinicInfo: { id: string; code: string; name: string } | null = null;
	if (locals.user.clinicId) {
		const rows = await locals.db
			.select({ id: clinic.id, code: clinic.code, name: clinic.name })
			.from(clinic)
			.where(eq(clinic.id, locals.user.clinicId))
			.limit(1);
		if (rows.length) clinicInfo = rows[0];
	}

	return {
		user: locals.user,
		clinic: clinicInfo
	};
};
