import { error, redirect } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { template } from "$lib/db/schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user || !locals.user.clinicId) throw redirect(302, "/dashboard");
	const rows = await locals.db
		.select()
		.from(template)
		.where(and(eq(template.id, params.id), eq(template.clinicId, locals.user.clinicId)))
		.limit(1);
	if (rows.length === 0) throw error(404, "Template not found");
	return { template: rows[0] };
};
