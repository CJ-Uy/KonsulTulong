/**
 * Domain types shared across schema, forms, scoring, and UI.
 */

export type Language = "en-PH" | "fil-PH" | "ceb-PH";

export type AnswerValue =
	| string
	| number
	| boolean
	| string[]
	| number[]
	| { systolic: number; diastolic: number }
	| { weight: number; height: number; unit?: "metric" | "imperial" }
	| { regions: string[] }
	| Record<string, unknown>
	| null;

export type Severity = "low" | "moderate" | "high" | "very_high";

export interface ResultBand {
	min: number;
	max: number;
	label: string;
	severity: Severity;
	advice: string;
	color: string;
}

export interface QuestionScoring {
	optionPoints?: Record<string, number>;
	coefficient?: number;
	buckets?: { min: number; max: number; points: number }[];
}

export type ScoringAlgorithm =
	| "additive"
	| "framingham"
	| "phq9"
	| "phq2"
	| "gad7"
	| "findrisc"
	| "audit_c"
	| "epworth"
	| "stop_bang"
	| "wells_dvt"
	| "cha2ds2_vasc"
	| "mini_cog"
	| "custom";

export interface ScoringConfig {
	algorithm: ScoringAlgorithm;
	resultBands: ResultBand[];
	customFormula?: string;
	redFlagRules?: {
		questionId: string;
		operator: "equals" | "gte" | "lte";
		value: number | string | boolean;
		message: string;
	}[];
}

export interface ScoreResult {
	total: number;
	band: ResultBand;
	breakdown: { questionId: string; points: number; label?: string }[];
	algorithm: ScoringAlgorithm;
	redFlags?: { questionId: string; message: string }[];
	computedAt: number;
}

export interface FlowNode {
	templateId: string;
	next: FlowEdge[];
}

export interface FlowEdge {
	toTemplateId: string;
	condition?: import("./forms").DisplayLogic;
	label?: string;
}

export interface ClinicSettings {
	defaultLanguage?: Language;
	enabledLanguages?: Language[];
	kioskIdleResetSeconds?: number;
	experimentalLiveQueue?: boolean;
	autoMatchByName?: boolean;
	autoMatchWindowMinutes?: number;
	requirePhone?: boolean;
	consentText?: string;
	consentVersion?: string;
	posterTagline?: string;
	posterLogoR2Key?: string;
}
