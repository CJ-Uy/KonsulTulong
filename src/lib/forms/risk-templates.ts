import type { FormField } from "$lib/types/forms";
import type { ScoringConfig } from "$lib/types";

export interface RiskTemplateSeed {
	slug: string;
	name: string;
	description: string;
	citation: string;
	assistedOnly?: boolean;
	questions: FormField[];
	scoring: ScoringConfig;
}

const PHQ9_RESPONSES = ["Not at all", "Several days", "More than half the days", "Nearly every day"];

function choice(id: string, text: string, options: { label: string; points: number }[]): FormField {
	return {
		id,
		order: 0,
		text,
		type: "multiple_choice",
		required: true,
		options: options.map((o) => o.label)
	};
}

// Helper: build PHQ-style 0/1/2/3 multiple choice
function phqQ(id: string, text: string): FormField {
	return choice(
		id,
		text,
		PHQ9_RESPONSES.map((label, i) => ({ label, points: i }))
	);
}

// To make scoring trivial, we encode the option index in the option value via a
// known convention: option order in the array equals point value (0..N). The
// scoring functions in scoring.ts look up the chosen option's index.

export const PHQ9: RiskTemplateSeed = {
	slug: "phq9",
	name: "PHQ-9 (Depression)",
	description:
		"Patient Health Questionnaire 9-item depression screen. Over the past 2 weeks, how often have you been bothered by the following problems?",
	citation:
		"Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001 Sep;16(9):606-13.",
	questions: [
		phqQ("phq9_q1", "Little interest or pleasure in doing things"),
		phqQ("phq9_q2", "Feeling down, depressed, or hopeless"),
		phqQ("phq9_q3", "Trouble falling or staying asleep, or sleeping too much"),
		phqQ("phq9_q4", "Feeling tired or having little energy"),
		phqQ("phq9_q5", "Poor appetite or overeating"),
		phqQ(
			"phq9_q6",
			"Feeling bad about yourself, or that you are a failure, or have let yourself or your family down"
		),
		phqQ("phq9_q7", "Trouble concentrating on things, such as reading or watching TV"),
		phqQ(
			"phq9_q8",
			"Moving or speaking slowly, or being so fidgety or restless that you have been moving around a lot more than usual"
		),
		phqQ(
			"phq9_q9",
			"Thoughts that you would be better off dead, or of hurting yourself in some way"
		)
	],
	scoring: {
		algorithm: "phq9",
		resultBands: [
			{
				min: 0,
				max: 4,
				label: "Minimal",
				severity: "low",
				advice: "Routine follow-up.",
				color: "#10b981"
			},
			{
				min: 5,
				max: 9,
				label: "Mild",
				severity: "low",
				advice: "Watchful waiting; repeat PHQ-9 at follow-up.",
				color: "#84cc16"
			},
			{
				min: 10,
				max: 14,
				label: "Moderate",
				severity: "moderate",
				advice: "Consider counseling, follow-up, or pharmacotherapy.",
				color: "#f59e0b"
			},
			{
				min: 15,
				max: 19,
				label: "Moderately severe",
				severity: "high",
				advice: "Active treatment with pharmacotherapy or psychotherapy.",
				color: "#f97316"
			},
			{
				min: 20,
				max: 27,
				label: "Severe",
				severity: "very_high",
				advice: "Initiate treatment promptly; consider specialist referral.",
				color: "#ef4444"
			}
		],
		redFlagRules: [
			{
				questionId: "phq9_q9",
				operator: "gte",
				value: 1,
				message: "Positive self-harm screen on PHQ-9 Q9. Assess safety before patient leaves."
			}
		]
	}
};

export const PHQ2: RiskTemplateSeed = {
	slug: "phq2",
	name: "PHQ-2 (Brief depression pre-screen)",
	description: "Brief 2-item depression pre-screen.",
	citation:
		"Kroenke K, Spitzer RL, Williams JB. The Patient Health Questionnaire-2: validity of a two-item depression screener. Med Care. 2003 Nov;41(11):1284-92.",
	questions: [
		phqQ("phq2_q1", "Little interest or pleasure in doing things"),
		phqQ("phq2_q2", "Feeling down, depressed, or hopeless")
	],
	scoring: {
		algorithm: "phq2",
		resultBands: [
			{
				min: 0,
				max: 2,
				label: "Negative",
				severity: "low",
				advice: "No further screening required.",
				color: "#10b981"
			},
			{
				min: 3,
				max: 6,
				label: "Positive",
				severity: "moderate",
				advice: "Administer PHQ-9 for diagnostic evaluation.",
				color: "#f59e0b"
			}
		]
	}
};

export const GAD7: RiskTemplateSeed = {
	slug: "gad7",
	name: "GAD-7 (Anxiety)",
	description: "Generalized Anxiety Disorder 7-item scale.",
	citation:
		"Spitzer RL, Kroenke K, Williams JB, Lowe B. A brief measure for assessing generalized anxiety disorder: the GAD-7. Arch Intern Med. 2006 May 22;166(10):1092-7.",
	questions: [
		phqQ("gad7_q1", "Feeling nervous, anxious, or on edge"),
		phqQ("gad7_q2", "Not being able to stop or control worrying"),
		phqQ("gad7_q3", "Worrying too much about different things"),
		phqQ("gad7_q4", "Trouble relaxing"),
		phqQ("gad7_q5", "Being so restless that it is hard to sit still"),
		phqQ("gad7_q6", "Becoming easily annoyed or irritable"),
		phqQ("gad7_q7", "Feeling afraid as if something awful might happen")
	],
	scoring: {
		algorithm: "gad7",
		resultBands: [
			{
				min: 0,
				max: 4,
				label: "Minimal",
				severity: "low",
				advice: "No clinical intervention indicated.",
				color: "#10b981"
			},
			{
				min: 5,
				max: 9,
				label: "Mild",
				severity: "low",
				advice: "Watchful waiting; repeat at follow-up.",
				color: "#84cc16"
			},
			{
				min: 10,
				max: 14,
				label: "Moderate",
				severity: "moderate",
				advice: "Further evaluation and possible treatment.",
				color: "#f59e0b"
			},
			{
				min: 15,
				max: 21,
				label: "Severe",
				severity: "high",
				advice: "Active treatment is probably warranted.",
				color: "#ef4444"
			}
		]
	}
};

export const AUDITC: RiskTemplateSeed = {
	slug: "audit-c",
	name: "AUDIT-C (Alcohol use)",
	description: "3-item alcohol use screening.",
	citation:
		"Bush K, Kivlahan DR, McDonell MB, et al. The AUDIT alcohol consumption questions (AUDIT-C). Arch Intern Med. 1998;158(16):1789-95.",
	questions: [
		choice("auditc_q1", "How often did you have a drink containing alcohol in the past year?", [
			{ label: "Never", points: 0 },
			{ label: "Monthly or less", points: 1 },
			{ label: "2 to 4 times a month", points: 2 },
			{ label: "2 to 3 times a week", points: 3 },
			{ label: "4 or more times a week", points: 4 }
		]),
		choice("auditc_q2", "How many drinks containing alcohol did you have on a typical day?", [
			{ label: "1 or 2", points: 0 },
			{ label: "3 or 4", points: 1 },
			{ label: "5 or 6", points: 2 },
			{ label: "7 to 9", points: 3 },
			{ label: "10 or more", points: 4 }
		]),
		choice("auditc_q3", "How often did you have six or more drinks on one occasion?", [
			{ label: "Never", points: 0 },
			{ label: "Less than monthly", points: 1 },
			{ label: "Monthly", points: 2 },
			{ label: "Weekly", points: 3 },
			{ label: "Daily or almost daily", points: 4 }
		])
	],
	scoring: {
		algorithm: "audit_c",
		resultBands: [
			{
				min: 0,
				max: 2,
				label: "Low risk (women) or below threshold",
				severity: "low",
				advice: "No further action.",
				color: "#10b981"
			},
			{
				min: 3,
				max: 3,
				label: "Positive for women",
				severity: "moderate",
				advice: "Brief alcohol counseling recommended.",
				color: "#f59e0b"
			},
			{
				min: 4,
				max: 12,
				label: "Positive",
				severity: "high",
				advice: "Brief intervention or referral; consider full AUDIT.",
				color: "#ef4444"
			}
		]
	}
};

const EPWORTH_OPTS = [
	"Would never doze",
	"Slight chance of dozing",
	"Moderate chance of dozing",
	"High chance of dozing"
];

function epQ(id: string, text: string): FormField {
	return {
		id,
		order: 0,
		text,
		type: "multiple_choice",
		required: true,
		options: EPWORTH_OPTS
	};
}

export const EPWORTH: RiskTemplateSeed = {
	slug: "epworth",
	name: "Epworth Sleepiness Scale",
	description:
		"How likely are you to doze off or fall asleep in the following situations, in contrast to feeling just tired?",
	citation:
		"Johns MW. A new method for measuring daytime sleepiness: the Epworth sleepiness scale. Sleep. 1991 Dec;14(6):540-5.",
	questions: [
		epQ("epworth_q1", "Sitting and reading"),
		epQ("epworth_q2", "Watching TV"),
		epQ("epworth_q3", "Sitting inactive in a public place (theater, meeting)"),
		epQ("epworth_q4", "As a passenger in a car for an hour without a break"),
		epQ("epworth_q5", "Lying down to rest in the afternoon when circumstances permit"),
		epQ("epworth_q6", "Sitting and talking to someone"),
		epQ("epworth_q7", "Sitting quietly after a lunch without alcohol"),
		epQ("epworth_q8", "In a car, while stopped for a few minutes in traffic")
	],
	scoring: {
		algorithm: "epworth",
		resultBands: [
			{
				min: 0,
				max: 5,
				label: "Lower normal",
				severity: "low",
				advice: "Normal daytime sleepiness.",
				color: "#10b981"
			},
			{
				min: 6,
				max: 10,
				label: "Higher normal",
				severity: "low",
				advice: "Higher but still within normal range.",
				color: "#84cc16"
			},
			{
				min: 11,
				max: 12,
				label: "Mild excessive sleepiness",
				severity: "moderate",
				advice: "Consider evaluating sleep habits or possible sleep disorder.",
				color: "#f59e0b"
			},
			{
				min: 13,
				max: 15,
				label: "Moderate excessive sleepiness",
				severity: "high",
				advice: "Sleep specialist evaluation recommended.",
				color: "#f97316"
			},
			{
				min: 16,
				max: 24,
				label: "Severe excessive sleepiness",
				severity: "very_high",
				advice: "Urgent sleep evaluation; advise on driving safety.",
				color: "#ef4444"
			}
		]
	}
};

function yn(id: string, text: string): FormField {
	return { id, order: 0, text, type: "boolean", required: true };
}

export const STOP_BANG: RiskTemplateSeed = {
	slug: "stop-bang",
	name: "STOP-BANG (OSA risk)",
	description: "Obstructive sleep apnea screening questionnaire.",
	citation:
		"Chung F, Yegneswaran B, Liao P, et al. STOP questionnaire: a tool to screen patients for obstructive sleep apnea. Anesthesiology. 2008 May;108(5):812-21.",
	questions: [
		yn("sb_snore", "Do you snore loudly (heard through closed doors)?"),
		yn("sb_tired", "Do you often feel tired or fatigued during the day?"),
		yn("sb_observed", "Has anyone observed you stop breathing during your sleep?"),
		yn("sb_pressure", "Do you have or are you being treated for high blood pressure?"),
		yn("sb_bmi", "Is your BMI more than 35?"),
		yn("sb_age", "Are you older than 50 years?"),
		yn("sb_neck", "Is your neck circumference greater than 40 cm?"),
		yn("sb_male", "Are you male?")
	],
	scoring: {
		algorithm: "additive",
		resultBands: [
			{
				min: 0,
				max: 2,
				label: "Low risk",
				severity: "low",
				advice: "Low risk of obstructive sleep apnea.",
				color: "#10b981"
			},
			{
				min: 3,
				max: 4,
				label: "Intermediate risk",
				severity: "moderate",
				advice: "Consider further evaluation; sleep study may be appropriate.",
				color: "#f59e0b"
			},
			{
				min: 5,
				max: 8,
				label: "High risk",
				severity: "high",
				advice: "Refer for sleep study; high probability of moderate-to-severe OSA.",
				color: "#ef4444"
			}
		]
	}
};

function num0to(id: string, text: string, max: number): FormField {
	return {
		id,
		order: 0,
		text,
		type: "number",
		required: true,
		numberConfig: { wholeNumbersOnly: true, allowNegative: false, validationType: "range", min: 0, max }
	};
}

export const MINI_COG: RiskTemplateSeed = {
	slug: "mini-cog",
	name: "Mini-Cog (Cognitive screen, assisted)",
	description:
		"Quick cognitive screen for dementia. Examiner-administered: 3-word recall and clock-drawing test, with the recall task interrupted by the clock-draw distractor.",
	citation:
		"Borson S, Scanlan J, Brush M, Vitaliano P, Dokmak A. The Mini-Cog: a cognitive 'vital signs' measure for dementia screening in multi-lingual elderly. Int J Geriatr Psychiatry. 2000 Nov;15(11):1021-7.",
	assistedOnly: true,
	questions: [
		{
			id: "mc_intro",
			order: 0,
			text: "Examiner script: say 3 unrelated words (e.g., Banana, Sunrise, Chair). Ask the patient to repeat them. Then have them draw a clock showing a specific time (e.g., 11:10). Then ask them to recall the 3 words.",
			type: "section_header"
		},
		num0to("mc_recall", "Words recalled correctly (0-3)", 3),
		num0to("mc_clock", "Clock-drawing test score: 0 = abnormal, 2 = normal", 2)
	],
	scoring: {
		algorithm: "additive",
		resultBands: [
			{
				min: 0,
				max: 2,
				label: "Positive screen",
				severity: "high",
				advice: "Further cognitive evaluation indicated.",
				color: "#ef4444"
			},
			{
				min: 3,
				max: 5,
				label: "Negative screen",
				severity: "low",
				advice: "No further cognitive workup indicated by this screen.",
				color: "#10b981"
			}
		]
	}
};

export const ALL_RISK_TEMPLATES: RiskTemplateSeed[] = [
	PHQ9,
	PHQ2,
	GAD7,
	AUDITC,
	EPWORTH,
	STOP_BANG,
	MINI_COG
];
