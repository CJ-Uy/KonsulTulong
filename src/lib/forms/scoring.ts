import type { FormField } from "$lib/types/forms";
import type {
	AnswerValue,
	ResultBand,
	ScoreResult,
	ScoringAlgorithm,
	ScoringConfig
} from "$lib/types";

function findBand(total: number, bands: ResultBand[]): ResultBand {
	const hit = bands.find((b) => total >= b.min && total <= b.max);
	if (hit) return hit;
	return {
		min: total,
		max: total,
		label: "Score recorded",
		severity: "low",
		advice: "",
		color: "#6b7280"
	};
}

function num(v: AnswerValue): number {
	if (typeof v === "number") return v;
	if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
	return 0;
}

interface Algorithm {
	(
		fields: FormField[],
		values: Record<string, AnswerValue>,
		cfg: ScoringConfig
	): { total: number; breakdown: { questionId: string; points: number; label?: string }[] };
}

const additive: Algorithm = (fields, values) => {
	const breakdown: { questionId: string; points: number; label?: string }[] = [];
	let total = 0;
	for (const f of fields) {
		const v = values[f.id];
		if (v === undefined || v === null) continue;
		let points = 0;
		if (f.type === "boolean") {
			points = v === true ? 1 : 0;
		} else if (f.type === "number") {
			points = num(v);
		} else if (typeof v === "string" && !Number.isNaN(Number(v))) {
			points = Number(v);
		} else if (Array.isArray(v)) {
			for (const item of v) {
				if (!Number.isNaN(Number(item))) points += Number(item);
			}
		}
		if (points !== 0) breakdown.push({ questionId: f.id, points, label: f.text });
		total += points;
	}
	return { total, breakdown };
};

/**
 * PHQ-style scoring: choice questions where the option's position in the array
 * encodes its point value (0..N). Indexing by option label, with a numeric
 * fallback for the rare case where the value is already a number.
 */
const phqLike: (questionIds: string[]) => Algorithm = (questionIds) => (fields, values) => {
	const fieldById = new Map(fields.map((f) => [f.id, f]));
	const breakdown = questionIds.map((id) => {
		const v = values[id];
		const field = fieldById.get(id);
		let points = 0;
		if (typeof v === "number") {
			points = v;
		} else if (typeof v === "string" && field?.options) {
			const idx = field.options.indexOf(v);
			if (idx >= 0) points = idx;
		}
		return { questionId: id, points };
	});
	const total = breakdown.reduce((s, b) => s + b.points, 0);
	return { total, breakdown };
};

const ALGORITHMS: Record<ScoringAlgorithm, Algorithm> = {
	additive,
	phq9: phqLike([
		"phq9_q1",
		"phq9_q2",
		"phq9_q3",
		"phq9_q4",
		"phq9_q5",
		"phq9_q6",
		"phq9_q7",
		"phq9_q8",
		"phq9_q9"
	]),
	phq2: phqLike(["phq2_q1", "phq2_q2"]),
	gad7: phqLike(["gad7_q1", "gad7_q2", "gad7_q3", "gad7_q4", "gad7_q5", "gad7_q6", "gad7_q7"]),
	audit_c: phqLike(["auditc_q1", "auditc_q2", "auditc_q3"]),
	epworth: phqLike([
		"epworth_q1",
		"epworth_q2",
		"epworth_q3",
		"epworth_q4",
		"epworth_q5",
		"epworth_q6",
		"epworth_q7",
		"epworth_q8"
	]),
	stop_bang: additive,
	findrisc: additive,
	framingham: additive,
	wells_dvt: additive,
	cha2ds2_vasc: additive,
	mini_cog: additive,
	custom: additive
};

/**
 * Pure scoring entry point.
 *
 * Computes a total + band from the chosen algorithm + the question values.
 * Returns null when the template has no scoring config. Red flags are surfaced
 * separately so the doctor view can highlight them irrespective of band.
 */
export function scoreResponse(
	fields: FormField[],
	values: Record<string, AnswerValue>,
	cfg: ScoringConfig | null | undefined
): ScoreResult | null {
	if (!cfg) return null;
	const algo = ALGORITHMS[cfg.algorithm] ?? additive;
	const { total, breakdown } = algo(fields, values, cfg);
	const band = findBand(total, cfg.resultBands);

	const redFlags: { questionId: string; message: string }[] = [];
	for (const rule of cfg.redFlagRules ?? []) {
		const left = values[rule.questionId];
		let hit = false;
		switch (rule.operator) {
			case "equals":
				hit = String(left) === String(rule.value);
				break;
			case "gte":
				hit = num(left) >= Number(rule.value);
				break;
			case "lte":
				hit = num(left) <= Number(rule.value);
				break;
		}
		if (hit) redFlags.push({ questionId: rule.questionId, message: rule.message });
	}

	return {
		total,
		band,
		breakdown,
		algorithm: cfg.algorithm,
		redFlags: redFlags.length > 0 ? redFlags : undefined,
		computedAt: Date.now()
	};
}
