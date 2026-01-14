/**
 * Dynamic Forms - Server Actions
 *
 * Server-side actions for managing form templates and submissions.
 */

import { db } from "$lib/db";
import { template, response, clinic } from "$lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type {
	FormTemplate,
	FormField,
	SaveTemplateResult,
	SubmitFormResult,
	SubmissionStatus
} from "$lib/types/forms";

// ============================================================================
// Template Management
// ============================================================================

/**
 * Get all templates for a clinic (including system templates)
 */
export async function getTemplatesForClinic(clinicId: string): Promise<FormTemplate[]> {
	const templates = await db
		.select()
		.from(template)
		.where(eq(template.isActive, true))
		.orderBy(desc(template.createdAt));

	// Filter to include system templates and clinic-specific templates
	const filtered = templates.filter((t) => t.type === "system" || t.clinicId === clinicId);

	return filtered.map(mapDbTemplateToFormTemplate);
}

/**
 * Get all templates for a clinic (only their own templates)
 */
export async function getClinicTemplates(clinicId: string): Promise<FormTemplate[]> {
	const templates = await db
		.select()
		.from(template)
		.where(and(eq(template.clinicId, clinicId), eq(template.isActive, true)))
		.orderBy(desc(template.createdAt));

	return templates.map(mapDbTemplateToFormTemplate);
}

/**
 * Get a single template by ID
 */
export async function getTemplateById(templateId: string): Promise<FormTemplate | null> {
	const [result] = await db.select().from(template).where(eq(template.id, templateId)).limit(1);

	if (!result) return null;

	return mapDbTemplateToFormTemplate(result);
}

/**
 * Create a new template
 */
export async function createTemplate(data: {
	name: string;
	description?: string;
	clinicId: string;
	questions: FormField[];
}): Promise<SaveTemplateResult> {
	try {
		const [result] = await db
			.insert(template)
			.values({
				name: data.name,
				description: data.description || null,
				clinicId: data.clinicId,
				type: "clinic",
				questions: data.questions,
				isActive: true
			})
			.returning({ id: template.id });

		return { success: true, templateId: result.id };
	} catch (error) {
		console.error("Failed to create template:", error);
		return { success: false, error: "Failed to create template" };
	}
}

/**
 * Update an existing template
 */
export async function updateTemplate(
	templateId: string,
	data: Partial<{
		name: string;
		description: string;
		questions: FormField[];
	}>
): Promise<SaveTemplateResult> {
	try {
		await db
			.update(template)
			.set({
				...data,
				updatedAt: new Date()
			})
			.where(eq(template.id, templateId));

		return { success: true, templateId };
	} catch (error) {
		console.error("Failed to update template:", error);
		return { success: false, error: "Failed to update template" };
	}
}

/**
 * Delete a template (soft delete)
 */
export async function deleteTemplate(
	templateId: string
): Promise<{ success: boolean; error?: string }> {
	try {
		await db
			.update(template)
			.set({
				isActive: false,
				deletedAt: new Date()
			})
			.where(eq(template.id, templateId));

		return { success: true };
	} catch (error) {
		console.error("Failed to delete template:", error);
		return { success: false, error: "Failed to delete template" };
	}
}

/**
 * Duplicate a template
 */
export async function duplicateTemplate(
	templateId: string,
	newName: string,
	clinicId: string
): Promise<SaveTemplateResult> {
	try {
		const original = await getTemplateById(templateId);
		if (!original) {
			return { success: false, error: "Template not found" };
		}

		return createTemplate({
			name: newName,
			description: original.description,
			clinicId,
			questions: original.questions
		});
	} catch (error) {
		console.error("Failed to duplicate template:", error);
		return { success: false, error: "Failed to duplicate template" };
	}
}

// ============================================================================
// Submission Management
// ============================================================================

/**
 * Submit form data
 */
export async function submitFormResponse(data: {
	templateId: string;
	clinicId: string;
	values: Record<string, unknown>;
}): Promise<SubmitFormResult> {
	try {
		const [result] = await db
			.insert(response)
			.values({
				templateId: data.templateId,
				clinicId: data.clinicId,
				values: data.values
			})
			.returning({ id: response.id });

		return { success: true, submissionId: result.id };
	} catch (error) {
		console.error("Failed to submit form:", error);
		return { success: false, error: "Failed to submit form" };
	}
}

/**
 * Get all submissions for a clinic
 */
export async function getSubmissionsForClinic(clinicId: string) {
	const submissions = await db
		.select()
		.from(response)
		.where(eq(response.clinicId, clinicId))
		.orderBy(desc(response.createdAt));

	return submissions;
}

/**
 * Get all submissions for a specific template
 */
export async function getSubmissionsForTemplate(templateId: string) {
	const submissions = await db
		.select()
		.from(response)
		.where(eq(response.templateId, templateId))
		.orderBy(desc(response.createdAt));

	return submissions;
}

/**
 * Get a single submission by ID
 */
export async function getSubmissionById(submissionId: string) {
	const [result] = await db.select().from(response).where(eq(response.id, submissionId)).limit(1);

	return result || null;
}

/**
 * Delete a submission
 */
export async function deleteSubmission(
	submissionId: string
): Promise<{ success: boolean; error?: string }> {
	try {
		await db.delete(response).where(eq(response.id, submissionId));

		return { success: true };
	} catch (error) {
		console.error("Failed to delete submission:", error);
		return { success: false, error: "Failed to delete submission" };
	}
}

// ============================================================================
// Clinic Management Helpers
// ============================================================================

/**
 * Get clinic by ID
 */
export async function getClinicById(clinicId: string) {
	const [result] = await db.select().from(clinic).where(eq(clinic.id, clinicId)).limit(1);

	return result || null;
}

/**
 * Get clinic by code
 */
export async function getClinicByCode(clinicCode: string) {
	const [result] = await db.select().from(clinic).where(eq(clinic.clinicCode, clinicCode)).limit(1);

	return result || null;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Map database template to FormTemplate type
 */
function mapDbTemplateToFormTemplate(dbTemplate: typeof template.$inferSelect): FormTemplate {
	return {
		id: dbTemplate.id,
		name: dbTemplate.name,
		description: dbTemplate.description || undefined,
		type: dbTemplate.type,
		status: dbTemplate.isActive ? "active" : "archived",
		clinicId: dbTemplate.clinicId || undefined,
		questions: dbTemplate.questions as FormField[],
		createdAt: dbTemplate.createdAt,
		updatedAt: dbTemplate.updatedAt || undefined
	};
}
