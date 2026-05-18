import { error, json } from "@sveltejs/kit";
import { and, asc, eq } from "drizzle-orm";
import { visit } from "$lib/db/schema";
import { manilaDateString } from "$lib/utils/ids";
import { requireRole } from "$lib/server/clinic-context";
import type { RequestHandler } from "./$types";

interface AdvanceBody {
	currentVisitId?: string | null;
}

/**
 * Doctor's "Done with this patient, call the next one" action.
 *
 * Two operations in one trip:
 *  1. Mark `currentVisitId` as `done` if it is currently `in_consult`.
 *  2. Find the next `queued` visit for today (lowest queue number) and mark it
 *     `in_consult`. Return its id so the doctor's view can jump.
 *
 * Idempotent on the second step: if no queued visit exists the response is
 * `nextVisitId: null` and the secretary view just shows an empty banner.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	const ctx = requireRole(locals, ["doctor", "admin"]);
	const body = ((await request.json().catch(() => null)) as AdvanceBody | null) ?? {};
	const today = manilaDateString();

	if (body.currentVisitId) {
		const cur = await locals.db
			.select({ status: visit.status })
			.from(visit)
			.where(and(eq(visit.id, body.currentVisitId), eq(visit.clinicId, ctx.clinicId)))
			.limit(1);
		if (cur.length === 0) throw error(404, "Current visit not found");
		if (cur[0].status === "in_consult") {
			await locals.db
				.update(visit)
				.set({ status: "done", completedAt: new Date() })
				.where(eq(visit.id, body.currentVisitId));
		}
	}

	const queued = await locals.db
		.select({ id: visit.id, queueNumber: visit.queueNumber })
		.from(visit)
		.where(
			and(
				eq(visit.clinicId, ctx.clinicId),
				eq(visit.queueDate, today),
				eq(visit.status, "queued")
			)
		)
		.orderBy(asc(visit.queueNumber))
		.limit(1);

	if (queued.length === 0) return json({ nextVisitId: null });

	await locals.db
		.update(visit)
		.set({ status: "in_consult", calledAt: new Date() })
		.where(eq(visit.id, queued[0].id));

	return json({ nextVisitId: queued[0].id, nextQueueNumber: queued[0].queueNumber });
};
