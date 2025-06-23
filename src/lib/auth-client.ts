import { createAuthClient } from "better-auth/svelte";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const { signIn, signUp, signOut, useSession, forgetPassword, resetPassword } =
	createAuthClient({
		baseURL: process.env.BETTER_AUTH_URL
	});
