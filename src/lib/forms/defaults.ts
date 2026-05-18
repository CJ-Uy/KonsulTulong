import type { FormField, FieldType } from "$lib/types/forms";
import { uuid } from "$lib/utils/ids";

/**
 * Returns a sensible default `FormField` for the given type at the given order.
 *
 * Choice-type fields seed with a single `"Option 1"` so the editor can render
 * its option list without the user having to click into an empty array first.
 */
export function defaultField(type: FieldType, order: number): FormField {
	const base: FormField = {
		id: uuid(),
		order,
		text: type === "section_header" ? "Section" : "New question",
		type,
		required: false
	};
	switch (type) {
		case "multiple_choice":
		case "checkbox":
		case "select":
			return { ...base, options: ["Option 1"] };
		case "number":
			return {
				...base,
				numberConfig: { wholeNumbersOnly: false, allowNegative: true, validationType: "none" }
			};
		case "repeater":
			return { ...base, columns: [] };
		default:
			return base;
	}
}

export const ALL_FIELD_TYPES: { type: FieldType; label: string }[] = [
	{ type: "short_answer", label: "Short answer" },
	{ type: "long_text", label: "Long text" },
	{ type: "number", label: "Number" },
	{ type: "date", label: "Date" },
	{ type: "boolean", label: "Yes / No" },
	{ type: "multiple_choice", label: "Single choice" },
	{ type: "checkbox", label: "Multi-select" },
	{ type: "select", label: "Dropdown" },
	{ type: "file_upload", label: "File upload" },
	{ type: "section_header", label: "Section header" }
];
