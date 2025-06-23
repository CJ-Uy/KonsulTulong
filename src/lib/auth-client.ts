import { createAuthClient } from "better-auth/svelte";

export const { signIn, signUp, signOut, useSession, forgetPassword, resetPassword } =
	createAuthClient({
		baseURL: process.env.BETTER_AUTH_URL
	});
