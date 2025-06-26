import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ params }) => {
	console.log(`The clinic code is ${params.clinic_code}`);

	// Sample template values
	return {
		form: [
			{
				id: "first_name",
				order: 1,
				text: "What is your first name?",
				type: "short_answer",
				required: true,
                placeholder: "Click Me"
			},
			{
				id: "last_name",
				order: 2,
				text: "What is your last name?",
				type: "short_answer",
				required: true,
				placeholder: "e.g., Smith"
			},
			{
				id: "date_of_birth",
				order: 3,
				text: "What is your date of birth?",
				type: "date",
				required: true
			},
			{
				id: "gender",
				order: 4,
				text: "What is your biological sex?",
				type: "multiple_choice",
				required: true,
				options: ["Male", "Female"]
			},
			{
				id: "is_pregnant",
				order: 5,
				text: "Are you currently pregnant or trying to become pregnant?",
				type: "boolean",
				required: true,
				displayLogic: {
					triggerQuestionId: "gender",
					operator: "equals",
					value: "Female"
				}
			},
			{
				id: "is_circumcised",
				order: 5,
				text: "Have you been circumcised?",
				type: "boolean",
				required: true,
				displayLogic: {
					triggerQuestionId: "gender",
					operator: "equals",
					value: "Female"
				}
			},
			{
				id: "health_habits_header",
				order: 6,
				text: "Health Habits",
				type: "section_header"
			},
			{
				id: "is_smoker",
				order: 7,
				text: "Have you smoked tobacco in the last 5 years?",
				type: "boolean",
				required: true
			},
			{
				id: "alcohol_per_week",
				order: 8,
				text: "On average, how many alcoholic drinks do you have per week?",
				type: "number",
				required: true
			},
			{
				id: "advanced_cardio_assessment",
				order: 9,
				text: "Advanced Cardiovascular Assessment",
				type: "section_header",
				displayLogic: {
					condition: "AND",
					rules: [
						{
							triggerQuestionId: "date_of_birth",
							operator: "ageGreaterThan",
							value: 45
						},
						{
							triggerQuestionId: "is_smoker",
							operator: "equals",
							value: true
						}
					]
				}
			},
			{
				id: "family_history_heart_disease",
				order: 10,
				text: "Do you have a first-degree relative (parent, sibling) with a history of heart disease before age 60?",
				type: "boolean",
				required: true,
				displayLogic: {
					condition: "AND",
					rules: [
						{
							triggerQuestionId: "date_of_birth",
							operator: "ageGreaterThan",
							value: 45
						},
						{
							triggerQuestionId: "is_smoker",
							operator: "equals",
							value: true
						}
					]
				}
			}
		]
	};
};
