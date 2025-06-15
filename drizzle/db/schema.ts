import { pgTable, varchar, jsonb } from "drizzle-orm/pg-core";
import { cuid2 } from "drizzle-cuid2/postgres";
import { id, timestamps } from "./column.helpers.ts";

export const users = pgTable("users", {
	...id,
	...timestamps,
	firstName: varchar("first_name"),
	lastName: varchar("last_name")
});

export const clinics = pgTable("clinics", {
	...id,
	...timestamps,
	clinicCode: varchar("clinic_code", { length: 6 }).notNull().unique(),
	userId: cuid2("user_id")
		.notNull()
		.references(() => users.id),
	activeTemplateId: cuid2("active_template_id").references(() => templates.id)
});

export const responses = pgTable("responses", {
	...id,
	...timestamps,
	clinicId: cuid2("clinic_id")
		.notNull()
		.references(() => clinics.id),
	templateId: cuid2("template_id")
		.notNull()
		.references(() => templates.id),
	values: jsonb("values").notNull()
});

export const templates = pgTable("templates", {
	...id,
	...timestamps,
	name: varchar("name", { length: 256 }).notNull().unique(),
	description: varchar("description", { length: 10000 }),
	questions: jsonb("questions").notNull()
});
