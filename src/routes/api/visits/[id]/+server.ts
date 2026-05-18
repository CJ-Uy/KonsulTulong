import { error, json } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { visit } from "$lib/db/schema";
import { requireRole } from "$lib/server/clinic-context";
import type { RequestHandler } from "./$types";

type Status = "queued" | "in_consult" | "done" | "skipped";

interface PatchBody {
	status?: Status;
	doctorNotes?: string;
	queueNumber?: number;
}

const ALLOWED_TRANSITIONS: Record<Status, Status[]> = {
	queued: ["in_consult", "skipped", "done"],
	in_consult: ["done", "queued"],
	done: ["queued"],
	skipped: ["queued"]
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	const ctx = requireRole(locals, ["secretary", "admin", "doctor"]);
	const body = (await request.json().catch(() => null)) as PatchBody | null;
	if (!body) throw error(400, "Missing body");

	const rows = await locals.db
		.select({ status: visit.status })
		.from(visit)
		.where(and(eq(visit.id, params.id), eq(visit.clinicId, ctx.clinicId)))
		.limit(1);
	if (rows.length === 0) throw error(404, "Visit not found");

	const update: Record<string, unknown> = {};

	if (body.status) {
		const current = rows[0].status as Status;
		if (current !== body.status && !ALLOWED_TRANSITIONS[current].includes(body.status)) {
			throw error(409, `Invalid status transition ${current} -> ${body.status}`);
		}
		update.status = body.status;
		if (body.status === "in_consult") update.calledAt = new Date();
		if (body.status === "done") update.completedAt = new Date();
	}

	if (typeof body.doctorNotes === "string") {
		update.doctorNotes = body.doctorNotes;
	}

	if (typeof body.queueNumber === "number" && Number.isFinite(body.queueNumber)) {
		update.queueNumber = body.queueNumber;
	}

	if (Object.keys(update).length === 0) {
		return json({ ok: true, noop: true });
	}

	await locals.db.update(visit).set(update).where(eq(visit.id, params.id));
	return json({ ok: true });
};
