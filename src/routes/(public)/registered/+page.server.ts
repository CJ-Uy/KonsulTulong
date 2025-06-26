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
	}
}; 