import { error, json } from "@sveltejs/kit";
import { and, desc, eq } from "drizzle-orm";
import { visit } from "$lib/db/schema";
import { uuid, manilaDateString } from "$lib/utils/ids";
import { requireRole } from "$lib/server/clinic-context";
import type { RequestHandler } from "./$types";

interface CreateBody {
	name: string;
	birthdate?: number | null;
	sex?: "M" | "F" | "U" | null;
	phone?: string | null;
}

/**
 * Secretary creates a new queue entry. Assigns the next per-day queue number
 * by looking at today's highest existing number for the clinic.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	const ctx = requireRole(locals, ["secretary", "admin", "doctor"]);
	const body = (await request.json().catch(() => null)) as CreateBody | null;
	if (!body?.name?.trim()) throw error(400, "Name required");

	const today = manilaDateString();

	const latest = await locals.db
		.select({ n: visit.queueNumber })
		.from(visit)
		.where(and(eq(visit.clinicId, ctx.clinicId), eq(visit.queueDate, today)))
		.orderBy(desc(visit.queueNumber))
		.limit(1);

	const next = latest.length === 0 ? 1 : latest[0].n + 1;
	const id = uuid();

	await locals.db.insert(visit).values({
		id,
		clinicId: ctx.clinicId,
		patientName: body.name.trim(),
		patientBirthdate: body.birthdate ? new Date(body.birthdate) : null,
		patientSex: body.sex ?? null,
		patientPhone: body.phone?.trim() || null,
		queueNumber: next,
		queueDate: today,
		status: "queued",
		arrivedAt: new Date()
	});

	return json({ id, queueNumber: next });
};
