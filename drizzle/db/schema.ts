import { pgTable, varchar } from "drizzle-orm/pg-core";
import { cuid2 } from "drizzle-cuid2/postgres";
import { id, timestamps } from "./column.helpers.ts";

export const users = pgTable("users", {
	...id,
	...timestamps
});

export const clinics = pgTable("clinics", {
	...id,
    ...timestamps,
    clinicCode: varchar("clinic_code", { length: 6 }).notNull().unique(),
	userId: cuid2("user_id")
		.notNull()
		.references(() => users.id)
});
