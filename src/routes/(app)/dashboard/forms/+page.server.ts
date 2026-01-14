import type { PageServerLoad, Actions } from "./$types";
import {
	getClinicTemplates,
	createTemplate,
	deleteTemplate,
	duplicateTemplate
} from "$lib/forms/actions";
import { fail, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals }) => {
	// TODO: Get clinicId from the authenticated user's context
	// For now, we'll use a placeholder - in production, get this from the user's session
	const clinicId = "placeholder-clinic-id";

	try {
		const templates = await getClinicTemplates(clinicId);
		return { templates };
	} catch (error) {
		console.error("Failed to load templates:", error);
		return { templates: [] };
	}
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get("name") as string;
		const description = formData.get("description") as string | null;
		const clinicId = formData.get("clinicId") as string;

		if (!name || !clinicId) {
			return fail(400, { error: "Name and clinic ID are required" });
		}

		const result = await createTemplate({
			name,
			description: description || undefined,
			clinicId,
			questions: []
		});

		if (!result.success) {
			return fail(500, { error: result.error });
		}

		throw redirect(303, `/dashboard/forms/${result.templateId}/edit`);
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const templateId = formData.get("templateId") as string;

		if (!templateId) {
			return fail(400, { error: "Template ID is required" });
		}

		const result = await deleteTemplate(templateId);

		if (!result.success) {
			return fail(500, { error: result.error });
		}

		return { success: true };
	},

	duplicate: async ({ request }) => {
		const formData = await request.formData();
		const templateId = formData.get("templateId") as string;
		const newName = formData.get("newName") as string;
		const clinicId = formData.get("clinicId") as string;

		if (!templateId || !newName || !clinicId) {
			return fail(400, { error: "Template ID, new name, and clinic ID are required" });
		}

		const result = await duplicateTemplate(templateId, newName, clinicId);

		if (!result.success) {
			return fail(500, { error: result.error });
		}

		throw redirect(303, `/dashboard/forms/${result.templateId}/edit`);
	}
};
