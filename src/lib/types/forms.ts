/**
 * Dynamic Forms System - Type Definitions
 *
 * This module defines all TypeScript types for the dynamic forms system,
 * allowing doctors and clinics to create custom forms without code changes.
 */

// ============================================================================
// Field Types
// ============================================================================

/**
 * All supported field types in the form builder
 */
export type FieldType =
	| "short_answer" // Single-line text input
	| "long_text" // Multi-line textarea
	| "number" // Numeric input with validation
	| "date" // Date picker
	| "multiple_choice" // Single-select radio buttons
	| "checkbox" // Multi-select checkboxes
	| "select" // Dropdown selection
	| "boolean" // Yes/No toggle
	| "file_upload" // File attachment
	| "section_header" // Visual separator/heading
	| "repeater"; // Repeating row groups

// ============================================================================
// Number Field Configuration
// ============================================================================

export interface NumberFieldConfig {
	wholeNumbersOnly?: boolean;
	allowNegative?: boolean;
	validationType?: "none" | "min" | "max" | "range";
	min?: number;
	max?: number;
}

// ============================================================================
// Display Logic (Conditional Field Visibility)
// ============================================================================

export type DisplayLogicOperator =
	| "equals"
	| "notEquals"
	| "greaterThan"
	| "lessThan"
	| "contains"
	| "ageGreaterThan" // Special operator for date fields
	| "ageLessThan"; // Special operator for date fields

export interface DisplayLogicRule {
	triggerQuestionId: string;
	operator: DisplayLogicOperator;
	value: string | number | boolean;
}

export interface DisplayLogic {
	// Simple single-rule logic
	triggerQuestionId?: string;
	operator?: DisplayLogicOperator;
	value?: string | number | boolean;

	// Compound logic with multiple rules
	condition?: "AND" | "OR";
	rules?: DisplayLogicRule[];
}

// ============================================================================
// Form Field Definition
// ============================================================================

export interface FormField {
	id: string; // Unique identifier (UUID or temp ID in builder)
	order: number; // Display order (0-indexed)
	text: string; // Field label/question text
	type: FieldType;
	required?: boolean;
	placeholder?: string;

	// For multiple_choice, checkbox, select
	options?: string[];

	// For repeater fields - nested columns
	columns?: FormField[];

	// For number fields
	numberConfig?: NumberFieldConfig;

	// Conditional display logic
	displayLogic?: DisplayLogic;
}

// ============================================================================
// Form Status and Template Types
// ============================================================================

export type FormStatus = "draft" | "active" | "archived";
export type TemplateType = "system" | "clinic";

// ============================================================================
// Complete Form/Template Definition
// ============================================================================

export interface FormTemplate {
	id: string;
	name: string;
	description?: string;
	type: TemplateType;
	status: FormStatus;
	clinicId?: string; // Only for clinic-specific templates
	questions: FormField[];
	version?: number;
	createdAt?: Date;
	updatedAt?: Date;
}

// ============================================================================
// File Upload Metadata
// ============================================================================

export interface FileMetadata {
	filename: string;
	storagePath: string;
	filetype: string;
	sizeBytes: number;
}

// ============================================================================
// Form Submission
// ============================================================================

export type SubmissionStatus =
	| "DRAFT"
	| "SUBMITTED"
	| "IN_REVIEW"
	| "APPROVED"
	| "REJECTED"
	| "NEEDS_REVISION"
	| "CANCELLED";

export interface FormSubmission {
	id: string;
	templateId: string;
	clinicId: string;
	submitterId?: string; // User ID if authenticated
	status: SubmissionStatus;
	values: Record<string, unknown>; // Field values keyed by field ID
	createdAt: Date;
	updatedAt: Date;
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationError {
	fieldId: string;
	message: string;
}

export interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
}

// ============================================================================
// Form Builder State Types
// ============================================================================

export interface FormBuilderState {
	template: FormTemplate;
	selectedFieldId: string | null;
	isDirty: boolean;
	isSaving: boolean;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface SaveTemplateResult {
	success: boolean;
	templateId?: string;
	error?: string;
}

export interface SubmitFormResult {
	success: boolean;
	submissionId?: string;
	error?: string;
}

// ============================================================================
// Helper Types for Components
// ============================================================================

/**
 * Props for individual field renderers
 */
export interface FieldRendererProps {
	field: FormField;
	value: unknown;
	onChange: (value: unknown) => void;
	error?: string;
	disabled?: boolean;
}

/**
 * Props for the form builder field card
 */
export interface FieldCardProps {
	field: FormField;
	isSelected: boolean;
	onSelect: () => void;
	onUpdate: (updates: Partial<FormField>) => void;
	onDelete: () => void;
	onMoveUp?: () => void;
	onMoveDown?: () => void;
}

/**
 * Available field type options for the field palette
 */
export const FIELD_TYPE_OPTIONS: { type: FieldType; label: string; icon: string }[] = [
	{ type: "short_answer", label: "Short Answer", icon: "type" },
	{ type: "long_text", label: "Long Text", icon: "align-left" },
	{ type: "number", label: "Number", icon: "hash" },
	{ type: "date", label: "Date", icon: "calendar" },
	{ type: "multiple_choice", label: "Multiple Choice", icon: "circle-dot" },
	{ type: "checkbox", label: "Checkboxes", icon: "check-square" },
	{ type: "select", label: "Dropdown", icon: "chevron-down" },
	{ type: "boolean", label: "Yes/No", icon: "toggle-left" },
	{ type: "file_upload", label: "File Upload", icon: "upload" },
	{ type: "section_header", label: "Section Header", icon: "heading" },
	{ type: "repeater", label: "Repeating Section", icon: "list-plus" }
];

/**
 * Default values for new fields
 */
export function createDefaultField(type: FieldType, order: number): FormField {
	const baseField: FormField = {
		id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
		order,
		text: "New Question",
		type,
		required: false
	};

	switch (type) {
		case "multiple_choice":
		case "checkbox":
		case "select":
			return { ...baseField, options: ["Option 1"] };
		case "repeater":
			return { ...baseField, columns: [] };
		case "number":
			return {
				...baseField,
				numberConfig: {
					wholeNumbersOnly: false,
					allowNegative: true,
					validationType: "none"
				}
			};
		case "section_header":
			return { ...baseField, text: "Section Title", required: false };
		default:
			return baseField;
	}
}
