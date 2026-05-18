import { drizzle } from "drizzle-orm/d1";
import { drizzle as drizzleProxy } from "drizzle-orm/sqlite-proxy";
import * as schema from "./schema";

export type DB = ReturnType<typeof drizzle<typeof schema>>;

/**
 * Returns a Drizzle D1 client.
 *
 * - Production (Workers runtime): native D1 binding from `platform.env.DB`.
 * - Dev fallback (no binding, e.g. `vite dev` without Miniflare): D1 HTTP REST API.
 */
export function getDb(platform: App.Platform | undefined): DB {
	const d1 = platform?.env?.DB;
	if (d1) return drizzle(d1, { schema });

	const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
	const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
	const token = process.env.CLOUDFLARE_D1_TOKEN;

	if (!accountId || !databaseId || !token) {
		throw new Error(
			"D1 binding unavailable and CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_D1_DATABASE_ID / CLOUDFLARE_D1_TOKEN env vars not set"
		);
	}

	return drizzleProxy(
		async (sqlText, params, method) => {
			const res = await fetch(
				`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json"
					},
					body: JSON.stringify({ sql: sqlText, params })
				}
			);
			if (!res.ok) throw new Error(`D1 HTTP ${res.status}: ${await res.text()}`);
			const data = (await res.json()) as {
				success: boolean;
				result?: { results?: Record<string, unknown>[] }[];
				errors?: { message: string }[];
			};
			if (!data.success) throw new Error(data.errors?.[0]?.message ?? "D1 query failed");
			if (method === "run") return { rows: [] };
			const results = data.result?.[0]?.results ?? [];
			if (!results.length) return { rows: [] };
			const cols = Object.keys(results[0]);
			const rows = results.map((r) => cols.map((c) => r[c]));
			return { rows: method === "get" ? (rows[0] as unknown[]) : rows } as {
				rows: unknown[];
			};
		},
		{ schema }
	) as unknown as DB;
}

export { schema };
