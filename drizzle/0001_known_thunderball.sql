CREATE TABLE "clinics" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"clinic_code" varchar(6) NOT NULL,
	"user_id" varchar(24) NOT NULL,
	"active_template_id" varchar(24),
	CONSTRAINT "clinics_clinic_code_unique" UNIQUE("clinic_code")
);
--> statement-breakpoint
CREATE TABLE "responses" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"clinic_id" varchar(24) NOT NULL,
	"template_id" varchar(24) NOT NULL,
	"values" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" varchar(10000),
	"questions" jsonb NOT NULL,
	CONSTRAINT "templates_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"first_name" varchar,
	"last_name" varchar
);
--> statement-breakpoint
DROP TABLE "user" CASCADE;--> statement-breakpoint
ALTER TABLE "clinics" ADD CONSTRAINT "clinics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinics" ADD CONSTRAINT "clinics_active_template_id_templates_id_fk" FOREIGN KEY ("active_template_id") REFERENCES "public"."templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE no action ON UPDATE no action;