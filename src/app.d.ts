// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { DB } from "$lib/db";

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			db: DB;
			user?: {
				id: string;
				email: string;
				name: string | null;
				role: "admin" | "doctor" | "secretary" | "unassigned";
				clinicId: string | null;
			};
			session?: {
				id: string;
				userId: string;
				expiresAt: Date;
			};
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				DB: D1Database;
				R2: R2Bucket;
				ASSETS: Fetcher;
				BETTER_AUTH_SECRET?: string;
				PUBLIC_BETTER_AUTH_URL?: string;
			};
			cf: CfProperties;
			ctx: ExecutionContext;
		}
	}
}

export {};
