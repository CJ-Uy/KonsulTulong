import { pgTable, varchar, jsonb, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { cuid2 } from "drizzle-cuid2/postgres";
import { id, timestamps } from "./column.helpers";

// --- Enums for Roles and Types ---
export const userRoleEnum = pgEnum("user_role", ["admin", "doctor", "secretary", "unassigned"]);
export const templateTypeEnum = pgEnum("template_type", ["system", "clinic"]);

export const user = pgTable("user", {
	id: text("id").primaryKey(), // better-auth generates the id upon sign up
	...timestamps,
	firstName: varchar("first_name"),
	lastName: varchar("last_name"),
	name: varchar("name"),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	clinicId: cuid2("clinic_id").references(() => clinic.id),
	role: userRoleEnum("role").default("secretary").notNull()
});

export const clinic = pgTable("clinic", {
	...id,
	...timestamps,
	clinicCode: varchar("clinic_code", { length: 6 }).notNull().unique(),
	clinicName: varchar("clinic_name")
});

export const template = pgTable("template", {
	...id,
	...timestamps,
	name: varchar("name", { length: 256 }).notNull(),
	description: varchar("description", { length: 10000 }),
	questions: jsonb("questions").notNull(),
	type: templateTypeEnum("type").default("system").notNull(),
	// Nullable because "system" templates don't belong to a clinic
	clinicId: cuid2("clinic_id").references(() => clinic.id, { onDelete: "cascade" })
});

export const response = pgTable("responses", {
	...id,
	...timestamps,
	clinicId: cuid2("clinic_id")
		.notNull()
		.references(() => clinic.id),
	templateId: cuid2("template_id")
		.notNull()
		.references(() => template.id),
	values: jsonb("values").notNull(),
});

// --- Join Tables ---

// Connects clinics to the templates they have chosen to use
export const clinicTemplates = pgTable("clinic_templates", {
	clinicId: cuid2("clinic_id")
		.notNull()
		.references(() => clinic.id, { onDelete: "cascade" }),
	templateId: cuid2("template_id")
		.notNull()
		.references(() => template.id, { onDelete: "cascade" }),
	isDefault: boolean("is_default").default(false).notNull()
});

// --- Auth & Session Tables ---

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
		.references(() => user.id, { onDelete: "cascade" })
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
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
	createdAt: timestamp("created_at").$defaultFn(() => new Date()),
	updatedAt: timestamp("updated_at").$defaultFn(() => new Date())
});
