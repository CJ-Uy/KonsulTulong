import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL is not set");
}

// Create a new Pool instance
const pool = new Pool({
	connectionString: connectionString
	// Optional: Add other pool configurations like max, idleTimeoutMillis, etc.
	// max: 20,
	// idleTimeoutMillis: 30000,
});

// Initialize Drizzle with the Pool and your schema
export const db = drizzle(pool, { schema: schema });
