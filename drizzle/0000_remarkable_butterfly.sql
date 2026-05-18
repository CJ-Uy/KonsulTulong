CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `attachment` (
	`id` text PRIMARY KEY NOT NULL,
	`response_id` text,
	`r2_key` text NOT NULL,
	`original_name` text,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`uploaded_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`response_id`) REFERENCES `response`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_type` text NOT NULL,
	`actor_id` text,
	`clinic_id` text NOT NULL,
	`action` text NOT NULL,
	`resource_type` text,
	`resource_id` text,
	`metadata` text,
	`at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_clinic_at` ON `audit_log` (`clinic_id`,`at`);--> statement-breakpoint
CREATE TABLE `clinic` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`settings` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clinic_code_unique` ON `clinic` (`code`);--> statement-breakpoint
CREATE TABLE `consent` (
	`id` text PRIMARY KEY NOT NULL,
	`response_id` text,
	`consent_text` text NOT NULL,
	`consent_version` text NOT NULL,
	`accepted_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`ip_hash` text,
	FOREIGN KEY (`response_id`) REFERENCES `response`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `flow` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`root_template_id` text NOT NULL,
	`nodes` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`clinic_id`) REFERENCES `clinic`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`root_template_id`) REFERENCES `template`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_flow_clinic` ON `flow` (`clinic_id`,`is_active`);--> statement-breakpoint
CREATE TABLE `response` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_id` text NOT NULL,
	`template_id` text NOT NULL,
	`template_version` integer NOT NULL,
	`flow_id` text,
	`patient_name` text NOT NULL,
	`patient_birthdate` integer,
	`patient_sex` text,
	`patient_phone` text,
	`values` text NOT NULL,
	`score` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`visit_id` text,
	`linked_at` integer,
	`linked_by` text,
	`started_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`submitted_at` integer,
	`consent_at` integer,
	FOREIGN KEY (`clinic_id`) REFERENCES `clinic`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`template_id`) REFERENCES `template`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`flow_id`) REFERENCES `flow`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`visit_id`) REFERENCES `visit`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`linked_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_response_visit` ON `response` (`visit_id`);--> statement-breakpoint
CREATE INDEX `idx_response_clinic_submitted` ON `response` (`clinic_id`,`submitted_at`);--> statement-breakpoint
CREATE INDEX `idx_response_patient_history` ON `response` (`clinic_id`,`patient_name`,`patient_birthdate`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `template` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_id` text,
	`is_system` integer DEFAULT false NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`citation` text,
	`questions` text NOT NULL,
	`scoring` text,
	`is_active` integer DEFAULT true NOT NULL,
	`assisted_only` integer DEFAULT false NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`clinic_id`) REFERENCES `clinic`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_template_clinic` ON `template` (`clinic_id`,`is_active`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`name` text,
	`first_name` text,
	`last_name` text,
	`image` text,
	`clinic_id` text,
	`role` text DEFAULT 'unassigned' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `visit` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_id` text NOT NULL,
	`patient_name` text NOT NULL,
	`patient_birthdate` integer,
	`patient_sex` text,
	`patient_phone` text,
	`queue_number` integer NOT NULL,
	`queue_date` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`arrived_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`called_at` integer,
	`completed_at` integer,
	`doctor_notes` text,
	FOREIGN KEY (`clinic_id`) REFERENCES `clinic`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_visit_clinic_day` ON `visit` (`clinic_id`,`queue_date`,`queue_number`);--> statement-breakpoint
CREATE INDEX `idx_visit_clinic_status` ON `visit` (`clinic_id`,`status`);