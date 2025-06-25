CREATE TYPE "public"."template_type" AS ENUM('system', 'clinic');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'doctor', 'secretary', 'unassigned');--> statement-breakpoint
CREATE TABLE "clinic_templates" (
	"clinic_id" varchar(24) NOT NULL,
	"template_id" varchar(24) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "template" DROP CONSTRAINT "template_name_unique";--> statement-breakpoint
ALTER TABLE "clinic" DROP CONSTRAINT "clinic_active_template_id_template_id_fk";
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "email_verified" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "template" ADD COLUMN "type" "template_type" DEFAULT 'system' NOT NULL;--> statement-breakpoint
ALTER TABLE "template" ADD COLUMN "clinic_id" varchar(24);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "user_role" DEFAULT 'secretary' NOT NULL;--> statement-breakpoint
ALTER TABLE "clinic_templates" ADD CONSTRAINT "clinic_templates_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_templates" ADD CONSTRAINT "clinic_templates_template_id_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."template"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template" ADD CONSTRAINT "template_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic" DROP COLUMN "active_template_id";