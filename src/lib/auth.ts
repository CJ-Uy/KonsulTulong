import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db";

export type AuthInstance = ReturnType<typeof betterAuth>;

/**
 * Creates a Better-Auth instance bound to the current request's D1 client.
 *
 * In Workers we can't construct auth at module scope because the D1 binding is per-request.
 * Each request gets a fresh instance — cheap since both the DB client and the drizzle adapter
 * are tiny objects.
 */
export function getAuth(platform: App.Platform | undefined, baseURL?: string): AuthInstance {
	const db = getDb(platform);

	const secret =
		platform?.env?.BETTER_AUTH_SECRET ??
		process.env.BETTER_AUTH_SECRET ??
		"dev-only-secret-change-me";

	return betterAuth({
		baseURL,
		secret,
		database: drizzleAdapter(db, {
			provider: "sqlite"
		}),
		emailAndPassword: {
			enabled: true,
			minPasswordLength: 8,
			maxPasswordLength: 64,
			autoSignIn: true
		},
		session: {
			expiresIn: 30 * 24 * 60 * 60
		},
		user: {
			additionalFields: {
				firstName: { type: "string", required: false },
				lastName: { type: "string", required: false },
				clinicId: { type: "string", required: false },
				role: { type: "string", required: false, defaultValue: "unassigned" }
			}
		}
	});
}
