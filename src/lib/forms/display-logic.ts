import type { DisplayLogic, DisplayLogicRule, DisplayLogicOperator } from "$lib/types/forms";
import type { AnswerValue } from "$lib/types";

function compare(
	left: AnswerValue,
	op: DisplayLogicOperator,
	right: string | number | boolean
): boolean {
	switch (op) {
		case "equals":
			return String(left) === String(right);
		case "notEquals":
			return String(left) !== String(right);
		case "greaterThan":
			return Number(left) > Number(right);
		case "lessThan":
			return Number(left) < Number(right);
		case "contains":
			if (Array.isArray(left)) return left.map(String).includes(String(right));
			return String(left ?? "").includes(String(right));
		case "ageGreaterThan":
		case "ageLessThan": {
			if (typeof left !== "number") return false;
			const ageYears = Math.floor((Date.now() - left) / (365.25 * 24 * 60 * 60 * 1000));
			return op === "ageGreaterThan" ? ageYears > Number(right) : ageYears < Number(right);
		}
		default:
			return false;
	}
}

function evalRule(rule: DisplayLogicRule, values: Record<string, AnswerValue>): boolean {
	const left = values[rule.triggerQuestionId];
	return compare(left, rule.operator, rule.value);
}

/**
 * Returns `true` if a field should be shown given the current form values.
 *
 * Supports a single rule (top-level operator/value) or a compound (`AND`/`OR`)
 * over `rules[]`. A field with no logic is always shown.
 */
export function shouldShow(
	logic: DisplayLogic | undefined,
	values: Record<string, AnswerValue>
): boolean {
	if (!logic) return true;

	if (logic.rules && logic.rules.length > 0) {
		if (logic.condition === "OR") return logic.rules.some((r) => evalRule(r, values));
		return logic.rules.every((r) => evalRule(r, values));
	}

	if (logic.triggerQuestionId && logic.operator !== undefined && logic.value !== undefined) {
		return compare(values[logic.triggerQuestionId], logic.operator, logic.value);
	}

	return true;
}
