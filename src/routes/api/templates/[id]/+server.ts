import { error, json } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { template } from "$lib/db/schema";
import { requireRole } from "$lib/server/clinic-context";
import type { FormField } from "$lib/types/forms";
import type { ScoringConfig } from "$lib/types";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, locals }) => {
	const ctx = requireRole(locals, ["doctor", "admin", "secretary"]);
	const rows = await locals.db
		.select()
		.from(template)
		.where(and(eq(template.id, params.id), eq(template.clinicId, ctx.clinicId)))
		.limit(1);
	if (rows.length === 0) throw error(404, "Template not found");
	return json(rows[0]);
};

interface PatchBody {
	name?: string;
	description?: string | null;
	questions?: FormField[];
	scoring?: ScoringConfig | null;
	isActive?: boolean;
	assistedOnly?: boolean;
}

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	const ctx = requireRole(locals, ["doctor", "admin"]);
	const body = (await request.json().catch(() => null)) as PatchBody | null;
	if (!body) throw error(400, "Missing body");

	const update: Record<string, unknown> = { updatedAt: new Date() };
	if (typeof body.name === "string") update.name = body.name;
	if (body.description !== undefined) update.description = body.description;
	if (body.questions) update.questions = body.questions;
	if (body.scoring !== undefined) update.scoring = body.scoring;
	if (typeof body.isActive === "boolean") update.isActive = body.isActive;
	if (typeof body.assistedOnly === "boolean") update.assistedOnly = body.assistedOnly;

	await locals.db
		.update(template)
		.set(update)
		.where(and(eq(template.id, params.id), eq(template.clinicId, ctx.clinicId)));

	return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const ctx = requireRole(locals, ["doctor", "admin"]);
	await locals.db
		.delete(template)
		.where(and(eq(template.id, params.id), eq(template.clinicId, ctx.clinicId)));
	return json({ ok: true });
};
