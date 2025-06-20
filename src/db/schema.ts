import { pgTable, varchar, jsonb, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { cuid2 } from "drizzle-cuid2/postgres";
import { id, timestamps } from "./column.helpers";

export const users = pgTable("users", {
	...id,
	...timestamps,
	firstName: varchar("first_name"),
	lastName: varchar("last_name"),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified")
		.$defaultFn(() => false)
		.notNull(),
	image: text("image")
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

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" })
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull()
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").$defaultFn(() => /* @__PURE__ */ new Date()),
	updatedAt: timestamp("updated_at").$defaultFn(() => /* @__PURE__ */ new Date())
});
