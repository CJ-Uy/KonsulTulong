import type { Actions } from './$types';
import { signIn } from '$lib/auth-client';

export const actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const email = data.get('email') as string;
		const password = data.get('pwd') as string;
        console.log("hello");

		try {
			await signIn.email(
				{
					email,
					password,
					callbackURL: "/dashboard",
				},
				{
					onError(context) {
						console.error(context.error.message);
					},
				}
			);
			return { success: true };
		} catch (error) {
			const err = error as Error;
			return { error: err.message };
		}
	}
} satisfies Actions;

