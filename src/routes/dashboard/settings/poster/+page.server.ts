import { redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";
import { clinic } from "$lib/db/schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, locals }) => {
	if (!locals.user || !locals.user.clinicId) throw redirect(302, "/dashboard");

	const rows = await locals.db
		.select({ id: clinic.id, code: clinic.code, name: clinic.name, settings: clinic.settings })
		.from(clinic)
		.where(eq(clinic.id, locals.user.clinicId))
		.limit(1);
	if (rows.length === 0) throw redirect(302, "/dashboard");

	const c = rows[0];
	const baseURL = `${url.protocol}//${url.host}`;
	const target = `${baseURL}/c/${c.code}`;

	const qrSvg = await QRCode.toString(target, {
		type: "svg",
		errorCorrectionLevel: "H",
		margin: 1,
		width: 800
	});

	return {
		clinic: c,
		qrSvg,
		target,
		tagline: c.settings?.posterTagline ?? "Sagutan habang naghihintay"
	};
};
