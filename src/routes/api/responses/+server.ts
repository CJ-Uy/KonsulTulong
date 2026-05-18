import { error, json } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { clinic, template, response, consent } from "$lib/db/schema";
import { uuid } from "$lib/utils/ids";
import type { RequestHandler } from "./$types";

interface StartBody {
	clinicCode: string;
	templateId: string;
	flowId?: string;
	patient: {
		name: string;
		birthdate: number | null;
		sex: "M" | "F" | "U" | null;
		phone: string | null;
	};
	consent: {
		text: string;
		version: string;
	};
}

/**
 * Starts a new draft response.
 *
 * Called once at the top of the kiosk wizard after the patient enters their
 * name and accepts the consent screen. Returns the new response id so the
 * wizard can autosave answers against it.
 */
export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
	const body = (await request.json().catch(() => null)) as StartBody | null;
	if (!body?.clinicCode || !body.templateId || !body.patient?.name) {
		throw error(400, "Missing required fields");
	}

	const clinicRows = await locals.db
		.select({ id: clinic.id })
		.from(clinic)
		.where(eq(clinic.code, body.clinicCode.toUpperCase()))
		.limit(1);
	if (clinicRows.length === 0) throw error(404, "Clinic not found");
	const clinicId = clinicRows[0].id;

	const tmpl = await locals.db
		.select({ id: template.id, version: template.version, isActive: template.isActive })
		.from(template)
		.where(and(eq(template.id, body.templateId), eq(template.clinicId, clinicId)))
		.limit(1);
	if (tmpl.length === 0 || !tmpl[0].isActive) throw error(404, "Template not found or inactive");

	const responseId = uuid();
	const now = new Date();

	await locals.db.insert(response).values({
		id: responseId,
		clinicId,
		templateId: tmpl[0].id,
		templateVersion: tmpl[0].version,
		flowId: body.flowId ?? null,
		patientName: body.patient.name.trim(),
		patientBirthdate: body.patient.birthdate ? new Date(body.patient.birthdate) : null,
		patientSex: body.patient.sex ?? null,
		patientPhone: body.patient.phone?.trim() || null,
		values: {},
		status: "draft",
		startedAt: now,
		consentAt: now
	});

	const ip = getClientAddress();
	const ipHash = ip
		? await crypto.subtle
				.digest("SHA-256", new TextEncoder().encode(ip))
				.then((buf) =>
					Array.from(new Uint8Array(buf))
						.map((b) => b.toString(16).padStart(2, "0"))
						.join("")
				)
		: null;

	await locals.db.insert(consent).values({
		id: uuid(),
		responseId,
		consentText: body.consent.text,
		consentVersion: body.consent.version,
		acceptedAt: now,
		ipHash
	});

	return json({ responseId });
};
