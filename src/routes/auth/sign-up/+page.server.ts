import type { Actions } from "./$types";
import { signUp } from "$lib/auth-client";
import { fail } from "@sveltejs/kit";
import { db } from "$lib/db";
import { user } from "$lib/db/schema";
import { eq } from "drizzle-orm";

export const actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const firstName = data.get("firstName") as string;
		const lastName = data.get("lastName") as string;
		const nickname = data.get("nickname") as string;
		const email = data.get("email") as string;
		const password = data.get("password") as string;

		// 1. Validate that we have everything
		if (!firstName || !lastName || !nickname || !email || !password) {
			// Using SvelteKit's `fail` is better for form actions
			return fail(400, { error: "All fields are required." });
		}

		try {
			// 2. Create a user with better-auth
			const newUserResponse = await signUp.email({
				email,
				password,
				name: nickname,
				callbackURL: "/dashboard",
				fetchOptions: {
					onError(context) {
						// Handle error (e.g., log or return error to page)
						console.error(context);
					}
				}
			});

			// 3. Check if user creation was successful and get the new user's ID
			if (newUserResponse.error || !newUserResponse.data?.user) {
				// If better-auth returned an error, pass it to the form
				return fail(400, { error: newUserResponse.error?.message ?? "Could not create user." });
			}

			const newUserId = newUserResponse.data.user.id;

			// 4. Update the user record with firstName and lastName using Drizzle
			await db.update(user).set({ firstName, lastName }).where(eq(user.id, newUserId));

			// 5. Return success message
			return { success: true, message: email };
		} catch (error) {
			const err = error as Error;
			return { error: err.message };
		}
	}
} satisfies Actions;
