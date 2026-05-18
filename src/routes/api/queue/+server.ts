import { json } from "@sveltejs/kit";
import { and, eq, isNull, asc, desc, sql } from "drizzle-orm";
import { visit, response, template } from "$lib/db/schema";
import { manilaDateString } from "$lib/utils/ids";
import { requireRole } from "$lib/server/clinic-context";
import type { RequestHandler } from "./$types";

/**
 * Returns today's queue plus today's unmatched submitted responses for the
 * current user's clinic. Polled by the secretary queue page.
 *
 * Doctors and admins use the same endpoint; the front-end decides what to
 * show or hide based on role (e.g. doctors see scores expanded).
 */
export const GET: RequestHandler = async ({ locals }) => {
	const ctx = requireRole(locals, ["secretary", "admin", "doctor"]);
	const today = manilaDateString();
	const dayStart = new Date(`${today}T00:00:00+08:00`).getTime();

	const visits = await locals.db
		.select()
		.from(visit)
		.where(and(eq(visit.clinicId, ctx.clinicId), eq(visit.queueDate, today)))
		.orderBy(asc(visit.queueNumber));

	const linkedResponses = await locals.db
		.select({
			id: response.id,
			visitId: response.visitId,
			templateId: response.templateId,
			templateName: template.name,
			patientName: response.patientName,
			patientBirthdate: response.patientBirthdate,
			score: response.score,
			status: response.status,
			submittedAt: response.submittedAt
		})
		.from(response)
		.innerJoin(template, eq(template.id, response.templateId))
		.where(and(eq(response.clinicId, ctx.clinicId), sql`${response.visitId} IS NOT NULL`));

	const unmatched = await locals.db
		.select({
			id: response.id,
			templateId: response.templateId,
			templateName: template.name,
			patientName: response.patientName,
			patientBirthdate: response.patientBirthdate,
			score: response.score,
			status: response.status,
			submittedAt: response.submittedAt
		})
		.from(response)
		.innerJoin(template, eq(template.id, response.templateId))
		.where(
			and(
				eq(response.clinicId, ctx.clinicId),
				isNull(response.visitId),
				eq(response.status, "submitted"),
				sql`${response.submittedAt} >= ${dayStart}`
			)
		)
		.orderBy(desc(response.submittedAt));

	return json({
		today,
		visits,
		linkedResponses,
		unmatched
	});
};
