import { error, json } from "@sveltejs/kit";
import { and, eq, inArray } from "drizzle-orm";
import { response, attachment } from "$lib/db/schema";
import { requireRole } from "$lib/server/clinic-context";
import { audit } from "$lib/server/audit";
import type { RequestHandler } from "./$types";

interface EraseBody {
	name: string;
	birthdate: number | null;
}

/**
 * Patient-data erasure tool, per PH DPA. Deletes all responses (and their
 * R2-backed attachments) matching the given name + birthdate in the current
 * clinic. Writes a `patient.erasure_request` audit row so deletions are
 * accountable.
 *
 * Requires admin role. We require a birthdate so a single common name does
 * not nuke unrelated patients by accident.
 */
export const POST: RequestHandler = async ({ request, platform, locals }) => {
	const ctx = requireRole(locals, ["admin"]);
	const body = (await request.json().catch(() => null)) as EraseBody | null;
	if (!body?.name || body.birthdate == null) throw error(400, "name and birthdate required");

	const matches = await locals.db
		.select({ id: response.id })
		.from(response)
		.where(
			and(
				eq(response.clinicId, ctx.clinicId),
				eq(response.patientName, body.name),
				eq(response.patientBirthdate, new Date(body.birthdate))
			)
		);

	if (matches.length === 0) {
		await audit(locals.db, {
			actorType: "admin",
			actorId: ctx.userId,
			clinicId: ctx.clinicId,
			action: "patient.erasure_request",
			metadata: { name: body.name, birthdate: body.birthdate, matched: 0 }
		});
		return json({ deleted: 0 });
	}

	const ids = matches.map((m) => m.id);

	const atts = await locals.db
		.select({ id: attachment.id, r2Key: attachment.r2Key })
		.from(attachment)
		.where(inArray(attachment.responseId, ids));

	if (platform?.env?.R2) {
		for (const a of atts) {
			try {
				await platform.env.R2.delete(a.r2Key);
			} catch {
				// ignore individual R2 delete failures; the DB row still goes
			}
		}
	}

	await locals.db.delete(attachment).where(inArray(attachment.responseId, ids));
	await locals.db.delete(response).where(inArray(response.id, ids));

	await audit(locals.db, {
		actorType: "admin",
		actorId: ctx.userId,
		clinicId: ctx.clinicId,
		action: "patient.erasure_request",
		metadata: { name: body.name, birthdate: body.birthdate, matched: ids.length }
	});

	return json({ deleted: ids.length });
};
