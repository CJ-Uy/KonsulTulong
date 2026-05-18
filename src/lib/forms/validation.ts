import type { FormField } from "$lib/types/forms";
import type { AnswerValue } from "$lib/types";
import { shouldShow } from "./display-logic";

export interface FieldError {
	fieldId: string;
	message: string;
}

export interface ValidationResult {
	valid: boolean;
	errors: FieldError[];
}

function isEmpty(value: AnswerValue): boolean {
	if (value === null || value === undefined) return true;
	if (typeof value === "string") return value.trim() === "";
	if (Array.isArray(value)) return value.length === 0;
	return false;
}

/**
 * Validates a form's currently-visible fields against the answer set.
 *
 * Hidden fields (failing `displayLogic`) are skipped. Required-but-empty
 * triggers an error. Number bounds are enforced. Regex validation runs only
 * for non-empty string values.
 */
export function validateForm(
	fields: FormField[],
	values: Record<string, AnswerValue>
): ValidationResult {
	const errors: FieldError[] = [];

	for (const field of fields) {
		if (field.type === "section_header") continue;
		if (!shouldShow(field.displayLogic, values)) continue;

		const v = values[field.id];

		if (field.required && isEmpty(v)) {
			errors.push({ fieldId: field.id, message: "This field is required" });
			continue;
		}
		if (isEmpty(v)) continue;

		if (field.type === "number" && field.numberConfig) {
			const n = Number(v);
			if (Number.isNaN(n)) {
				errors.push({ fieldId: field.id, message: "Must be a number" });
				continue;
			}
			if (field.numberConfig.wholeNumbersOnly && !Number.isInteger(n)) {
				errors.push({ fieldId: field.id, message: "Must be a whole number" });
				continue;
			}
			if (!field.numberConfig.allowNegative && n < 0) {
				errors.push({ fieldId: field.id, message: "Must not be negative" });
				continue;
			}
			if (
				field.numberConfig.validationType !== "none" &&
				field.numberConfig.min !== undefined &&
				n < field.numberConfig.min
			) {
				errors.push({
					fieldId: field.id,
					message: `Must be at least ${field.numberConfig.min}`
				});
				continue;
			}
			if (
				field.numberConfig.validationType !== "none" &&
				field.numberConfig.max !== undefined &&
				n > field.numberConfig.max
			) {
				errors.push({
					fieldId: field.id,
					message: `Must be at most ${field.numberConfig.max}`
				});
				continue;
			}
		}
	}

	return { valid: errors.length === 0, errors };
}

/**
 * Returns 0..100 percent of required visible fields that have an answer.
 * Useful for the kiosk progress bar.
 */
export function completionPercent(
	fields: FormField[],
	values: Record<string, AnswerValue>
): number {
	const visible = fields.filter(
		(f) => f.type !== "section_header" && shouldShow(f.displayLogic, values)
	);
	if (visible.length === 0) return 100;
	const answered = visible.filter((f) => !isEmpty(values[f.id])).length;
	return Math.round((answered / visible.length) * 100);
}
