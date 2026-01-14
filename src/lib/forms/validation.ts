/**
 * Dynamic Forms - Validation System
 *
 * Provides client-side and server-side validation for form submissions.
 */

import type {
	FormField,
	ValidationResult,
	ValidationError,
	DisplayLogic,
	DisplayLogicRule,
	NumberFieldConfig
} from "$lib/types/forms";

// ============================================================================
// Display Logic Evaluation
// ============================================================================

/**
 * Calculate age from a date of birth
 */
function calculateAge(dob: Date): number {
	const today = new Date();
	let age = today.getFullYear() - dob.getFullYear();
	const monthDiff = today.getMonth() - dob.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
		age--;
	}
	return age;
}

/**
 * Evaluate a single display logic rule
 */
function evaluateRule(rule: DisplayLogicRule, formData: Record<string, unknown>): boolean {
	const triggerValue = formData[rule.triggerQuestionId];

	switch (rule.operator) {
		case "equals":
			return triggerValue === rule.value;

		case "notEquals":
			return triggerValue !== rule.value;

		case "greaterThan":
			return typeof triggerValue === "number" && triggerValue > (rule.value as number);

		case "lessThan":
			return typeof triggerValue === "number" && triggerValue < (rule.value as number);

		case "contains":
			if (typeof triggerValue === "string") {
				return triggerValue.includes(rule.value as string);
			}
			if (Array.isArray(triggerValue)) {
				return triggerValue.includes(rule.value);
			}
			return false;

		case "ageGreaterThan": {
			if (!triggerValue) return false;
			const dob = new Date(triggerValue as string);
			if (isNaN(dob.getTime())) return false;
			return calculateAge(dob) > (rule.value as number);
		}

		case "ageLessThan": {
			if (!triggerValue) return false;
			const dob = new Date(triggerValue as string);
			if (isNaN(dob.getTime())) return false;
			return calculateAge(dob) < (rule.value as number);
		}

		default:
			return true;
	}
}

/**
 * Evaluate display logic to determine if a field should be shown
 */
export function shouldDisplayField(field: FormField, formData: Record<string, unknown>): boolean {
	const logic = field.displayLogic;

	// No logic means always show
	if (!logic) return true;

	// Compound logic with multiple rules
	if (logic.condition && logic.rules && logic.rules.length > 0) {
		if (logic.condition === "AND") {
			return logic.rules.every((rule) => evaluateRule(rule, formData));
		} else {
			return logic.rules.some((rule) => evaluateRule(rule, formData));
		}
	}

	// Simple single-rule logic
	if (logic.triggerQuestionId && logic.operator) {
		return evaluateRule(
			{
				triggerQuestionId: logic.triggerQuestionId,
				operator: logic.operator,
				value: logic.value as string | number | boolean
			},
			formData
		);
	}

	// Invalid or empty logic means always show
	return true;
}

// ============================================================================
// Field Validation
// ============================================================================

/**
 * Validate a number field value
 */
function validateNumberField(value: unknown, config?: NumberFieldConfig): string | null {
	if (value === "" || value === undefined || value === null) {
		return null; // Required validation handled separately
	}

	const numVal = Number(value);

	if (isNaN(numVal)) {
		return "Please enter a valid number";
	}

	if (config?.wholeNumbersOnly && !Number.isInteger(numVal)) {
		return "Please enter a whole number";
	}

	if (config?.allowNegative === false && numVal < 0) {
		return "Negative numbers are not allowed";
	}

	if (config?.validationType === "min" && config.min !== undefined) {
		if (numVal < config.min) {
			return `Value must be at least ${config.min}`;
		}
	}

	if (config?.validationType === "max" && config.max !== undefined) {
		if (numVal > config.max) {
			return `Value must be at most ${config.max}`;
		}
	}

	if (config?.validationType === "range") {
		if (config.min !== undefined && numVal < config.min) {
			return `Value must be at least ${config.min}`;
		}
		if (config.max !== undefined && numVal > config.max) {
			return `Value must be at most ${config.max}`;
		}
	}

	return null;
}

/**
 * Check if a value is empty
 */
function isEmpty(value: unknown): boolean {
	if (value === undefined || value === null || value === "") {
		return true;
	}
	if (Array.isArray(value) && value.length === 0) {
		return true;
	}
	if (typeof value === "object" && Object.keys(value as object).length === 0) {
		return true;
	}
	return false;
}

/**
 * Validate a single field
 */
function validateField(
	field: FormField,
	value: unknown,
	formData: Record<string, unknown>
): string | null {
	// Skip validation for hidden fields
	if (!shouldDisplayField(field, formData)) {
		return null;
	}

	// Skip validation for section headers
	if (field.type === "section_header") {
		return null;
	}

	// Required field validation
	if (field.required && isEmpty(value)) {
		return `${field.text} is required`;
	}

	// Type-specific validation
	switch (field.type) {
		case "number":
			return validateNumberField(value, field.numberConfig);

		case "date":
			if (value && isNaN(new Date(value as string).getTime())) {
				return "Please enter a valid date";
			}
			break;

		case "checkbox":
			// For checkboxes, check if at least one is selected when required
			if (field.required && typeof value === "object" && value !== null) {
				const hasSelection = Object.values(value as Record<string, boolean>).some(
					(v) => v === true
				);
				if (!hasSelection) {
					return "Please select at least one option";
				}
			}
			break;

		case "repeater":
			// Validate repeater has at least one row when required
			if (field.required && Array.isArray(value) && value.length === 0) {
				return "Please add at least one entry";
			}
			// Note: Individual column validation happens separately
			break;
	}

	return null;
}

// ============================================================================
// Form Validation
// ============================================================================

/**
 * Validate all form fields
 */
export function validateForm(
	fields: FormField[],
	formData: Record<string, unknown>
): ValidationResult {
	const errors: ValidationError[] = [];

	for (const field of fields) {
		const value = formData[field.id];
		const error = validateField(field, value, formData);

		if (error) {
			errors.push({ fieldId: field.id, message: error });
		}

		// Validate nested repeater columns
		if (field.type === "repeater" && field.columns && Array.isArray(value)) {
			for (let rowIndex = 0; rowIndex < value.length; rowIndex++) {
				const row = value[rowIndex] as Record<string, unknown>;
				for (const column of field.columns) {
					const colValue = row?.[column.id];
					const colError = validateField(column, colValue, formData);
					if (colError) {
						errors.push({
							fieldId: `${field.id}[${rowIndex}].${column.id}`,
							message: `Row ${rowIndex + 1}: ${colError}`
						});
					}
				}
			}
		}
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

/**
 * Get validation error for a specific field
 */
export function getFieldError(
	fieldId: string,
	validationResult: ValidationResult
): string | undefined {
	const error = validationResult.errors.find((e) => e.fieldId === fieldId);
	return error?.message;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if the form is complete (all required visible fields filled)
 */
export function isFormComplete(fields: FormField[], formData: Record<string, unknown>): boolean {
	const result = validateForm(fields, formData);
	return result.isValid;
}

/**
 * Get list of visible fields based on current form data
 */
export function getVisibleFields(
	fields: FormField[],
	formData: Record<string, unknown>
): FormField[] {
	return fields.filter((field) => shouldDisplayField(field, formData));
}

/**
 * Calculate form completion percentage
 */
export function getCompletionPercentage(
	fields: FormField[],
	formData: Record<string, unknown>
): number {
	const visibleFields = getVisibleFields(fields, formData).filter(
		(f) => f.type !== "section_header"
	);

	if (visibleFields.length === 0) return 100;

	const requiredFields = visibleFields.filter((f) => f.required);
	if (requiredFields.length === 0) return 100;

	const filledRequired = requiredFields.filter((f) => !isEmpty(formData[f.id]));

	return Math.round((filledRequired.length / requiredFields.length) * 100);
}
