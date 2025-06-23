import type { Actions } from './$types';
import { signUp } from "$lib/auth-client";

export const actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const firstName = data.get('firstName') as string;
		const lastName = data.get('lastName') as string;
		const email = data.get('email') as string;
		const password = data.get('password') as string;

		try {
			await signUp.email({
				email,
				password,
				name: `${firstName} ${lastName}`,
				callbackURL: "/dashboard",
				fetchOptions: {
					onError(context) {
						// Handle error (e.g., log or return error to page)
						console.error(context.error.message);
					},
				},
			});
			return { success: true, message: email };
		} catch (error) {
			const err = error as Error;
			return { error: err.message };
		}
	}
} satisfies Actions;