import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import type { FormField } from "$lib/types/forms";
import type {
	AnswerValue,
	ClinicSettings,
	FlowNode,
	ScoreResult,
	ScoringConfig
} from "$lib/types";

/**
 * Typed JSON column helper.
 */
const json = <T>(name: string) => text(name, { mode: "json" }).$type<T>();

const tsMs = (name: string) => integer(name, { mode: "timestamp_ms" });
const bool = (name: string) => integer(name, { mode: "boolean" });

// -- Auth (Better-Auth) -------------------------------------------------------

export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	email: text("email").notNull().unique(),
	emailVerified: bool("email_verified").default(false).notNull(),
	name: text("name"),
	firstName: text("first_name"),
	lastName: text("last_name"),
	image: text("image"),
	clinicId: text("clinic_id"),
	role: text("role", { enum: ["admin", "doctor", "secretary", "unassigned"] })
		.notNull()
		.default("unassigned"),
	createdAt: tsMs("created_at")
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	updatedAt: tsMs("updated_at")
		.notNull()
		.default(sql`(unixepoch() * 1000)`)
});

export const session = sqliteTable("session", {
	id: text("id").primaryKey(),
	expiresAt: tsMs("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: tsMs("created_at").notNull(),
	updatedAt: tsMs("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" })
});

export const account = sqliteTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: tsMs("access_token_expires_at"),
	refreshTokenExpiresAt: tsMs("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: tsMs("created_at").notNull(),
	updatedAt: tsMs("updated_at").notNull()
});

export const verification = sqliteTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: tsMs("expires_at").notNull(),
	createdAt: tsMs("created_at")
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	updatedAt: tsMs("updated_at")
		.notNull()
		.default(sql`(unixepoch() * 1000)`)
});

// -- Domain -------------------------------------------------------------------

export const clinic = sqliteTable("clinic", {
	id: text("id").primaryKey(),
	code: text("code").notNull().unique(),
	name: text("name").notNull(),
	settings: json<ClinicSettings>("settings"),
	createdAt: tsMs("created_at")
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	updatedAt: tsMs("updated_at")
		.notNull()
		.default(sql`(unixepoch() * 1000)`)
});

export const template = sqliteTable(
	"template",
	{
		id: text("id").primaryKey(),
		clinicId: text("clinic_id").references(() => clinic.id, { onDelete: "cascade" }),
		isSystem: bool("is_system").notNull().default(false),
		name: text("name").notNull(),
		description: text("description"),
		citation: text("citation"),
		questions: json<FormField[]>("questions").notNull(),
		scoring: json<ScoringConfig>("scoring"),
		isActive: bool("is_active").notNull().default(true),
		assistedOnly: bool("assisted_only").notNull().default(false),
		version: integer("version").notNull().default(1),
		createdAt: tsMs("created_at")
			.notNull()
			.default(sql`(unixepoch() * 1000)`),
		updatedAt: tsMs("updated_at")
			.notNull()
			.default(sql`(unixepoch() * 1000)`)
	},
	(t) => ({
		byClinic: index("idx_template_clinic").on(t.clinicId, t.isActive)
	})
);

export const flow = sqliteTable(
	"flow",
	{
		id: text("id").primaryKey(),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		description: text("description"),
		rootTemplateId: text("root_template_id")
			.notNull()
			.references(() => template.id),
		nodes: json<FlowNode[]>("nodes").notNull(),
		isActive: bool("is_active").notNull().default(true),
		isDefault: bool("is_default").notNull().default(false),
		createdAt: tsMs("created_at")
			.notNull()
			.default(sql`(unixepoch() * 1000)`),
		updatedAt: tsMs("updated_at")
			.notNull()
			.default(sql`(unixepoch() * 1000)`)
	},
	(t) => ({
		byClinic: index("idx_flow_clinic").on(t.clinicId, t.isActive)
	})
);

export const visit = sqliteTable(
	"visit",
	{
		id: text("id").primaryKey(),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		patientName: text("patient_name").notNull(),
		patientBirthdate: tsMs("patient_birthdate"),
		patientSex: text("patient_sex", { enum: ["M", "F", "U"] }),
		patientPhone: text("patient_phone"),
		queueNumber: integer("queue_number").notNull(),
		queueDate: text("queue_date").notNull(),
		status: text("status", { enum: ["queued", "in_consult", "done", "skipped"] })
			.notNull()
			.default("queued"),
		arrivedAt: tsMs("arrived_at")
			.notNull()
			.default(sql`(unixepoch() * 1000)`),
		calledAt: tsMs("called_at"),
		completedAt: tsMs("completed_at"),
		doctorNotes: text("doctor_notes")
	},
	(t) => ({
		byClinicDay: index("idx_visit_clinic_day").on(t.clinicId, t.queueDate, t.queueNumber),
		byClinicStatus: index("idx_visit_clinic_status").on(t.clinicId, t.status)
	})
);

export const response = sqliteTable(
	"response",
	{
		id: text("id").primaryKey(),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		templateId: text("template_id")
			.notNull()
			.references(() => template.id),
		templateVersion: integer("template_version").notNull(),
		flowId: text("flow_id").references(() => flow.id),
		patientName: text("patient_name").notNull(),
		patientBirthdate: tsMs("patient_birthdate"),
		patientSex: text("patient_sex", { enum: ["M", "F", "U"] }),
		patientPhone: text("patient_phone"),
		values: json<Record<string, AnswerValue>>("values").notNull(),
		score: json<ScoreResult>("score"),
		status: text("status", { enum: ["draft", "submitted"] })
			.notNull()
			.default("draft"),
		visitId: text("visit_id").references(() => visit.id, { onDelete: "set null" }),
		linkedAt: tsMs("linked_at"),
		linkedBy: text("linked_by").references(() => user.id),
		startedAt: tsMs("started_at")
			.notNull()
			.default(sql`(unixepoch() * 1000)`),
		submittedAt: tsMs("submitted_at"),
		consentAt: tsMs("consent_at")
	},
	(t) => ({
		byVisit: index("idx_response_visit").on(t.visitId),
		byClinicSubmitted: index("idx_response_clinic_submitted").on(t.clinicId, t.submittedAt),
		byPatientHistory: index("idx_response_patient_history").on(
			t.clinicId,
			t.patientName,
			t.patientBirthdate
		)
	})
);

export const attachment = sqliteTable("attachment", {
	id: text("id").primaryKey(),
	responseId: text("response_id").references(() => response.id, { onDelete: "cascade" }),
	r2Key: text("r2_key").notNull(),
	originalName: text("original_name"),
	mime: text("mime").notNull(),
	size: integer("size").notNull(),
	uploadedAt: tsMs("uploaded_at")
		.notNull()
		.default(sql`(unixepoch() * 1000)`)
});

export const consent = sqliteTable("consent", {
	id: text("id").primaryKey(),
	responseId: text("response_id").references(() => response.id, { onDelete: "cascade" }),
	consentText: text("consent_text").notNull(),
	consentVersion: text("consent_version").notNull(),
	acceptedAt: tsMs("accepted_at")
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	ipHash: text("ip_hash")
});

export const auditLog = sqliteTable(
	"audit_log",
	{
		id: text("id").primaryKey(),
		actorType: text("actor_type", {
			enum: ["patient", "doctor", "secretary", "admin", "system"]
		}).notNull(),
		actorId: text("actor_id"),
		clinicId: text("clinic_id").notNull(),
		action: text("action").notNull(),
		resourceType: text("resource_type"),
		resourceId: text("resource_id"),
		metadata: json<Record<string, unknown>>("metadata"),
		at: tsMs("at")
			.notNull()
			.default(sql`(unixepoch() * 1000)`)
	},
	(t) => ({
		byClinicAt: index("idx_audit_clinic_at").on(t.clinicId, t.at)
	})
);
