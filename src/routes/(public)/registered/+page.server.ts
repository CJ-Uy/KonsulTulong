import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/db';
import { clinic } from '$lib/db/schema';
import type { Actions } from './$types';
import { eq } from 'drizzle-orm';

export const actions: Actions = {
	createClinic: async ({ request }) => {
		const formData = await request.formData();
		const clinicName = formData.get('clinicName');
		const clinicCode = formData.get('clinicCode');

		if (!clinicName || typeof clinicName !== 'string' || clinicName.trim().length < 2) {
			return fail(400, { error: 'Clinic name is required and must be at least 2 characters.' });
		}
		if (!clinicCode || typeof clinicCode !== 'string' || clinicCode.length !== 6) {
			return fail(400, { error: 'Clinic code must be exactly 6 characters.' });
		}

		// Check for code uniqueness
		const existing = await db.select().from(clinic).where(eq(clinic.clinicCode, clinicCode));
		if (existing.length > 0) {
			return fail(400, { error: 'Clinic code already exists. Please randomize again.' });
		}

		await db.insert(clinic).values({
			clinicName,
			clinicCode
		});

		throw redirect(303, '/dashboard');
	},

	generateCode: async () => {
		function randomCode() {
			const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
			return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
		}

		let code;
		let exists = true;
		let attempts = 0;
		while (exists && attempts < 20) {
			code = randomCode();
			const found = await db.select().from(clinic).where(eq(clinic.clinicCode, code));
			exists = found.length > 0;
			attempts++;
		}
		if (exists) {
			return { code: '' };
		}
		return { code };
	}
}; 