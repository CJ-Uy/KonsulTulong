ALTER TABLE "clinic" DROP CONSTRAINT "clinic_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "clinic_id" varchar(24);--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic" DROP COLUMN "user_id";