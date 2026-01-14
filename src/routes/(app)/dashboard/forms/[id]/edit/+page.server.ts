import type { PageServerLoad, Actions } from "./$types";
import { getTemplateById, updateTemplate } from "$lib/forms/actions";
import { fail, redirect, error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
	const template = await getTemplateById(params.id);

	if (!template) {
		throw error(404, "Form template not found");
	}

	return { template };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const formData = await request.formData();
		const name = formData.get("name") as string;
		const description = formData.get("description") as string | null;
		const questionsJson = formData.get("questions") as string;

		if (!name) {
			return fail(400, { error: "Form name is required" });
		}

		let questions;
		try {
			questions = JSON.parse(questionsJson);
		} catch {
			return fail(400, { error: "Invalid questions data" });
		}

		const result = await updateTemplate(params.id, {
			name,
			description: description || undefined,
			questions
		});

		if (!result.success) {
			return fail(500, { error: result.error });
		}

		return { success: true };
	}
};
