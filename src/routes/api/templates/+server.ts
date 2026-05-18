import { error, json } from "@sveltejs/kit";
import { and, eq, desc } from "drizzle-orm";
import { template } from "$lib/db/schema";
import { uuid } from "$lib/utils/ids";
import { requireRole } from "$lib/server/clinic-context";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
	const ctx = requireRole(locals, ["doctor", "admin", "secretary"]);
	const rows = await locals.db
		.select({
			id: template.id,
			name: template.name,
			description: template.description,
			isActive: template.isActive,
			isSystem: template.isSystem,
			assistedOnly: template.assistedOnly,
			version: template.version,
			updatedAt: template.updatedAt
		})
		.from(template)
		.where(eq(template.clinicId, ctx.clinicId))
		.orderBy(desc(template.updatedAt));
	return json({ templates: rows });
};

interface CreateBody {
	name?: string;
	description?: string;
}

export const POST: RequestHandler = async ({ request, locals }) => {
	const ctx = requireRole(locals, ["doctor", "admin"]);
	const body = ((await request.json().catch(() => null)) as CreateBody | null) ?? {};
	const id = uuid();
	await locals.db.insert(template).values({
		id,
		clinicId: ctx.clinicId,
		isSystem: false,
		name: body.name?.trim() || "Untitled form",
		description: body.description ?? null,
		questions: [],
		isActive: false,
		version: 1
	});
	return json({ id });
};

export const DELETE: RequestHandler = async ({ url, locals }) => {
	const ctx = requireRole(locals, ["doctor", "admin"]);
	const id = url.searchParams.get("id");
	if (!id) throw error(400, "id required");
	await locals.db
		.delete(template)
		.where(and(eq(template.id, id), eq(template.clinicId, ctx.clinicId)));
	return json({ ok: true });
};
