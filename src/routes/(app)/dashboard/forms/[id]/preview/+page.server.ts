import type { PageServerLoad } from "./$types";
import { getTemplateById } from "$lib/forms/actions";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
	const template = await getTemplateById(params.id);

	if (!template) {
		throw error(404, "Form template not found");
	}

	return { template };
};
