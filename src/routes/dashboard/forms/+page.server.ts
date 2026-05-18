import { redirect } from "@sveltejs/kit";
import { desc, eq } from "drizzle-orm";
import { template } from "$lib/db/schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || !locals.user.clinicId) throw redirect(302, "/dashboard");
	const rows = await locals.db
		.select({
			id: template.id,
			name: template.name,
			description: template.description,
			isActive: template.isActive,
			assistedOnly: template.assistedOnly,
			version: template.version,
			updatedAt: template.updatedAt
		})
		.from(template)
		.where(eq(template.clinicId, locals.user.clinicId))
		.orderBy(desc(template.updatedAt));
	return { templates: rows, role: locals.user.role };
};
