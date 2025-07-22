import { z } from "zod/v4";

export const schema = z.object({
	// Section: Patient Identification
	patientInformation: z.object({
		caseNumber: z.string(),
		patientLocation: z.string().optional(),
		name: z.object({
		  last: z.string(),
		  first: z.string(),
		  middle: z.string().optional(),
		}),
		age: z.number().int().positive(),
		sex: z.enum(["Male", "Female", "Other"]),
		dateOfBirth: z.date().or(z.string()),
		contactNo: z.string().optional(),
		address: z.string().optional(),
		emergencyContact: z.object({
		  name: z.string().optional(),
		  relationship: z.string().optional(),
		  contactNo: z.string().optional(),
		}),
	}),
	
	// Section: Surgical Details
	surgicalDetails: z.object({
		surgicalService: z.object({
		  trauma: z.boolean().optional(),
		  gs1: z.boolean().optional(),
		  gs2: z.boolean().optional(),
		  gs3: z.boolean().optional(),
		  urology: z.boolean().optional(),
		  pedia: z.boolean().optional(),
		  burn: z.boolean().optional(),
		  plasticSurgery: z.boolean().optional(),
		  tcvs: z.boolean().optional(),
		  nss: z.boolean().optional(),
		  orthopedics: z.boolean().optional(),
		  orl: z.boolean().optional(),
		  ophtha: z.boolean().optional(),
		  obGyn: z.boolean().optional(),
		  dentistry: z.boolean().optional(),
		  others: z.string().optional(), // For the "Others" text field
		}),
		preOperativeDiagnosis: z.string().optional(),
		proposedSurgicalPlan: z.string().optional(),
		estimatedBloodLoss: z.string().optional(),
	}),
	
	// Section: Pre-Operative History
	preOperativeHistory: z.object({
		allergies: z.object({
		  hasAllergies: z.boolean(),
		  details: z.string().optional(),
		}),
		cardiacPulmonary: z.object({
		  highBloodPressure: z.boolean(),
		  chestPain: z.boolean(),
		  irregularHeartBeat: z.boolean(),
		  heartDisease: z.boolean(),
		  heartAttack: z.boolean(),
		  difficultyOfBreathing: z.boolean(),
		  asthma: z.object({ hasAsthma: z.boolean(), lastAttack: z.string().optional() }),
		  pneumonia: z.boolean(),
		  copdPulmonaryTb: z.boolean(),
		  medication: z.string().optional(),
		}),
		gastrointestinalGenitourinary: z.object({
		  refluxHeartburn: z.boolean(),
		  hiatalHernia: z.boolean(),
		  gastricUlcer: z.boolean(),
		  liverDisease: z.boolean(),
		  kidneyDisease: z.boolean(),
		  pregnant: z.object({ isPregnant: z.boolean(), lastMenstrualPeriod: z.string().optional() }),
		}),
		hematopoietic: z.object({
		  dvtBloodClots: z.boolean(),
		  bleedingTendency: z.boolean(),
		  anemia: z.boolean(),
		  bloodDisease: z.boolean(),
		}),
		endocrine: z.object({
		  diabetes: z.boolean(),
		  thyroidDisease: z.boolean(),
		}),
		neuropsychiatricMusculoskeletal: z.object({
		  stroke: z.object({ hasStroke: z.boolean(), when: z.string().optional() }),
		  seizures: z.boolean(),
		  psychiatricIllness: z.boolean(),
		  motionSickness: z.boolean(),
		  numbness: z.boolean(),
		  muscleWeakness: z.boolean(),
		  jointDisease: z.boolean(),
		}),
		otherInformation: z.object({
		  otherMedicalTreatment: z.object({ hasTreatment: z.boolean(), details: z.string().optional() }),
		  aspirinHerbal: z.object({ hasTaken: z.boolean(), details: z.string().optional() }),
		  smoker: z.object({ isSmoker: z.boolean(), details: z.string().optional() }),
		  alcoholDrinker: z.object({ isDrinker: z.boolean(), details: z.string().optional() }),
		  others: z.string().optional(),
		}),
	}),
	
	// Section: Past Surgical / Anesthetic History
	pastSurgicalHistory: z.object({
		surgeries: z.array(z.object({
			date: z.date().or(z.string()).optional(),
			procedure: z.string().optional(),
			typeOfAnesthesia: z.string().optional(),
			complications: z.string().optional(),
		  })
		).optional(),
		familyAnesthesiaComplication: z.object({
		  hasComplication: z.boolean(),
		  specify: z.string().optional(),
		}),
	}),
	
	// Section: Physical Examination
	physicalExamination: z.object({
		vitals: z.object({
		  weightKg: z.number().optional(),
		  heightCm: z.number().optional(),
		  bmi: z.number().optional(),
		  bp: z.string().optional(),
		  hr: z.string().optional(),
		  rr: z.string().optional(),
		  temp: z.string().optional(),
		  spo2: z.string().optional(),
		}),
		findings: z.object({
		  general: z.string().optional(),
		  heent: z.string().optional(),
		  chestLungs: z.string().optional(),
		  heart: z.string().optional(),
		  abdomen: z.string().optional(),
		  extremities: z.string().optional(),
		  neurologic: z.string().optional(),
		  ecg: z.string().optional(),
		}),
		laboratories: z.object({
		  hematology: z.object({ hgb: z.string().optional(), hct: z.string().optional(), wbc: z.string().optional(), plt: z.string().optional(), neut: z.string().optional(), lym: z.string().optional(), pt: z.string().optional(), ptt: z.string().optional() }).optional(),
		  biochemistry: z.object({ na: z.string().optional(), k: z.string().optional(), cl: z.string().optional(), glu: z.string().optional(), chol: z.string().optional(), bun: z.string().optional(), crea: z.string().optional() }).optional(),
		  urinalysis: z.object({ color: z.string().optional(), ph: z.string().optional(), sg: z.string().optional(), cho: z.string().optional(), chon: z.string().optional(), rbc: z.string().optional(), wbc: z.string().optional(), bact: z.string().optional(), cast: z.string().optional() }).optional(),
		}).optional(),
	}),
	
	// Section: Anesthesia Assessment
	anesthesiaAssessment: z.object({
		airwayDental: z.object({
		  normal: z.boolean(),
		  mouthOpening: z.boolean(),
		  thyromentalDistance: z.boolean(),
		  mallampati: z.enum(["I", "II", "III", "IV"]),
		  fullNeckExtension: z.boolean(),
		  missingLooseTeeth: z.boolean(),
		  dentalCrownBridgeBraces: z.boolean(),
		  details: z.string().optional(), // For notes on teeth/dental
		}),
	}),
	
	// Section: Clinical Risk and Plan
	clinicalRiskAndPlan: z.object({
		revisedCardiacRisk: z.string().optional(),
		functionalCapacity: z.enum(["1MET", "4-10METS", ">10METS"]).optional(),
		pulmonaryRiskFactors: z.string().optional(),
		surgicalRiskProcedure: z.enum(["High", "Intermediate", "Low"]).optional(),
		anestheticPlan: z.object({
		  generalAnesthesia: z.boolean().optional(),
		  regionalAnesthesia: z.boolean().optional(),
		  combinedGaRa: z.boolean().optional(),
		  laMac: z.boolean().optional(),
		  sedation: z.boolean().optional(),
		  tiva: z.boolean().optional(),
		  pnb: z.boolean().optional(),
		  gaPnb: z.boolean().optional(),
		  others: z.string().optional(),
		}),
		asaScore: z.enum(["I", "II", "III", "IV", "V", "E"]),
		medicalRiskAssessment: z.object({
		  cardiac: z.string().optional(),
		  pulmonary: z.string().optional(),
		  othersRecommendations: z.string().optional(),
		}),
		recommendations: z.string().optional(),
		painScore: z.string().optional(),
	}),
	
	// Section: Signatures and Confirmation
	confirmation: z.object({
		conforme: z.string().optional(),
		physician: z.string().optional(),
		patientSignature: z.string().optional(),
		doctorSignature: z.string().optional(),
		dateTime: z.date().or(z.string()).optional(),
	}),

	// Metadata for your application's use
	status: z.string().optional(), // e.g., 'Pending', 'Completed'
	waitingTime: z.string().optional(), // You had this in your original schema
});

export type Schema = z.infer<typeof schema>;
