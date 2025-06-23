ALTER TABLE "clinics" RENAME TO "clinic";--> statement-breakpoint
ALTER TABLE "templates" RENAME TO "template";--> statement-breakpoint
ALTER TABLE "users" RENAME TO "user";--> statement-breakpoint
ALTER TABLE "clinic" DROP CONSTRAINT "clinics_clinic_code_unique";--> statement-breakpoint
ALTER TABLE "template" DROP CONSTRAINT "templates_name_unique";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "clinic" DROP CONSTRAINT "clinics_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "clinic" DROP CONSTRAINT "clinics_active_template_id_templates_id_fk";
--> statement-breakpoint
ALTER TABLE "responses" DROP CONSTRAINT "responses_clinic_id_clinics_id_fk";
--> statement-breakpoint
ALTER TABLE "responses" DROP CONSTRAINT "responses_template_id_templates_id_fk";
--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic" ADD CONSTRAINT "clinic_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic" ADD CONSTRAINT "clinic_active_template_id_template_id_fk" FOREIGN KEY ("active_template_id") REFERENCES "public"."template"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_template_id_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."template"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic" ADD CONSTRAINT "clinic_clinic_code_unique" UNIQUE("clinic_code");--> statement-breakpoint
ALTER TABLE "template" ADD CONSTRAINT "template_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_email_unique" UNIQUE("email");