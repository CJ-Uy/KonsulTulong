import { type Schema as AnesthesiaSurveyData } from "$lib/components/schemas";
const surveyData: AnesthesiaSurveyData[] = [
	// Patient 1: Juan Dela Cruz - Has some common comorbidities
	{
	  patientInformation: {
		caseNumber: "PGH-001",
		patientLocation: "Ward 5",
		name: { last: "Dela Cruz", first: "Juan", middle: "Reyes" },
		age: 45,
		sex: "Male",
		dateOfBirth: new Date("1979-05-20"),
		contactNo: "09171234567",
		address: "123 Rizal Ave, Manila",
		emergencyContact: {
		  name: "Juana Dela Cruz",
		  relationship: "Wife",
		  contactNo: "09177654321",
		},
	  },
	  surgicalDetails: {
		surgicalService: { gs1: true }, // General Surgery 1
		preOperativeDiagnosis: "Cholelithiasis",
		proposedSurgicalPlan: "Laparoscopic Cholecystectomy",
		estimatedBloodLoss: "50cc",
	  },
	  preOperativeHistory: {
		allergies: { hasAllergies: false },
		cardiacPulmonary: {
		  highBloodPressure: true,
		  chestPain: false,
		  irregularHeartBeat: false,
		  heartDisease: false,
		  heartAttack: false,
		  difficultyOfBreathing: false,
		  asthma: { hasAsthma: false },
		  pneumonia: false,
		  copdPulmonaryTb: false,
		  medication: "Losartan 50mg OD",
		},
		gastrointestinalGenitourinary: {
		  refluxHeartburn: true,
		  hiatalHernia: false,
		  gastricUlcer: false,
		  liverDisease: false,
		  kidneyDisease: false,
		  pregnant: { isPregnant: false },
		},
		hematopoietic: { dvtBloodClots: false, bleedingTendency: false, anemia: false, bloodDisease: false },
		endocrine: { diabetes: false, thyroidDisease: false },
		neuropsychiatricMusculoskeletal: {
		  stroke: { hasStroke: false },
		  seizures: false,
		  psychiatricIllness: false,
		  motionSickness: false,
		  numbness: false,
		  muscleWeakness: false,
		  jointDisease: true,
		},
		otherInformation: {
		  otherMedicalTreatment: { hasTreatment: false },
		  aspirinHerbal: { hasTaken: false },
		  smoker: { isSmoker: false, details: "Stopped 10 years ago" },
		  alcoholDrinker: { isDrinker: true, details: "Socially, 1-2 bottles/week" },
		},
	  },
	  pastSurgicalHistory: {
		surgeries: [{ date: new Date("2010-01-15"), procedure: "Appendectomy", typeOfAnesthesia: "Spinal", complications: "None" }],
		familyAnesthesiaComplication: { hasComplication: false },
	  },
	  physicalExamination: {
		vitals: { weightKg: 80, heightCm: 170, bmi: 27.7, bp: "130/80", hr: "78", rr: "16", temp: "36.8", spo2: "98%" },
		findings: { general: "Awake, alert", heent: "Anicteric sclerae, pink conjunctivae", chestLungs: "Clear breath sounds", heart: "Adynamic precordium, distinct heart sounds", abdomen: "Soft, non-tender", extremities: "Full pulses, no edema", neurologic: "GCS 15, intact cranial nerves", ecg: "Normal Sinus Rhythm" },
		laboratories: { hematology: { hgb: "140" }, biochemistry: { crea: "1.1" } },
	  },
	  anesthesiaAssessment: {
		airwayDental: { normal: true, mouthOpening: true, thyromentalDistance: true, mallampati: "II", fullNeckExtension: true, missingLooseTeeth: false, dentalCrownBridgeBraces: false },
	  },
	  clinicalRiskAndPlan: {
		asaScore: "II",
		anestheticPlan: { generalAnesthesia: true },
		medicalRiskAssessment: { cardiac: "Low" },
	  },
	  confirmation: { dateTime: new Date() },
	  status: "Waiting",
	  waitingTime: "2 days",
	},
  
	// Patient 2: Maria Santos - Young and healthy
	{
	  patientInformation: {
		caseNumber: "PGH-002",
		patientLocation: "ER",
		name: { last: "Santos", first: "Maria", middle: "Lim" },
		age: 32,
		sex: "Female",
		dateOfBirth: new Date("1992-11-10"),
		contactNo: "09181234567",
		address: "456 Bonifacio St, Quezon City",
		emergencyContact: { name: "Mario Santos", relationship: "Husband", contactNo: "09187654321" },
	  },
	  surgicalDetails: {
		surgicalService: { orthopedics: true },
		preOperativeDiagnosis: "Tibial Plateau Fracture, Right",
		proposedSurgicalPlan: "Open Reduction Internal Fixation",
		estimatedBloodLoss: "200cc",
	  },
	  preOperativeHistory: {
		allergies: { hasAllergies: true, details: "Penicillin - Rashes" },
		cardiacPulmonary: { highBloodPressure: false, chestPain: false, irregularHeartBeat: false, heartDisease: false, heartAttack: false, difficultyOfBreathing: false, asthma: { hasAsthma: false }, pneumonia: false, copdPulmonaryTb: false },
		gastrointestinalGenitourinary: { refluxHeartburn: false, hiatalHernia: false, gastricUlcer: false, liverDisease: false, kidneyDisease: false, pregnant: { isPregnant: false } },
		hematopoietic: { dvtBloodClots: false, bleedingTendency: false, anemia: false, bloodDisease: false },
		endocrine: { diabetes: false, thyroidDisease: false },
		neuropsychiatricMusculoskeletal: { stroke: { hasStroke: false }, seizures: false, psychiatricIllness: false, motionSickness: true, numbness: false, muscleWeakness: false, jointDisease: false },
		otherInformation: { otherMedicalTreatment: { hasTreatment: false }, aspirinHerbal: { hasTaken: false }, smoker: { isSmoker: false }, alcoholDrinker: { isDrinker: false } },
	  },
	  pastSurgicalHistory: {
		surgeries: [],
		familyAnesthesiaComplication: { hasComplication: false },
	  },
	  physicalExamination: {
		vitals: { weightKg: 55, heightCm: 160, bmi: 21.5, bp: "110/70", hr: "85", rr: "18", temp: "37.0", spo2: "99%" },
		findings: { general: "Awake, alert, in pain", heent: "Normal", chestLungs: "Clear", heart: "Normal", abdomen: "Normal", extremities: "Deformity on right leg", neurologic: "Normal" },
		laboratories: {},
	  },
	  anesthesiaAssessment: {
		airwayDental: { normal: true, mouthOpening: true, thyromentalDistance: true, mallampati: "I", fullNeckExtension: true, missingLooseTeeth: false, dentalCrownBridgeBraces: true, details: "Braces on top and bottom" },
	  },
	  clinicalRiskAndPlan: {
		asaScore: "I",
		anestheticPlan: { regionalAnesthesia: true },
		medicalRiskAssessment: {},
	  },
	  confirmation: { dateTime: new Date() },
	  status: "In Process",
	  waitingTime: "1 day",
	},
	
	// Patient 3: Pedro Reyes - Smoker with a more difficult airway
	{
		patientInformation: {
		  caseNumber: "PGH-003",
		  patientLocation: "Ward 2",
		  name: { last: "Reyes", first: "Pedro", middle: "Garcia" },
		  age: 28,
		  sex: "Male",
		  dateOfBirth: new Date("1996-08-12"),
		  contactNo: "09191234567",
		  address: "789 Mabini Blvd, Pasay",
		  emergencyContact: { name: "Petra Reyes", relationship: "Sister", contactNo: "09197654321" },
		},
		surgicalDetails: {
		  surgicalService: { orl: true },
		  preOperativeDiagnosis: "Chronic Tonsillitis with Obstruction",
		  proposedSurgicalPlan: "Tonsillectomy",
		  estimatedBloodLoss: "100cc",
		},
		preOperativeHistory: {
		  allergies: { hasAllergies: false },
		  cardiacPulmonary: { highBloodPressure: false, chestPain: false, irregularHeartBeat: false, heartDisease: false, heartAttack: false, difficultyOfBreathing: true, asthma: { hasAsthma: false }, pneumonia: false, copdPulmonaryTb: false },
		  gastrointestinalGenitourinary: { refluxHeartburn: false, hiatalHernia: false, gastricUlcer: false, liverDisease: false, kidneyDisease: false, pregnant: { isPregnant: false } },
		  hematopoietic: { dvtBloodClots: false, bleedingTendency: false, anemia: false, bloodDisease: false },
		  endocrine: { diabetes: false, thyroidDisease: false },
		  neuropsychiatricMusculoskeletal: { stroke: { hasStroke: false }, seizures: false, psychiatricIllness: false, motionSickness: false, numbness: false, muscleWeakness: false, jointDisease: false },
		  otherInformation: { otherMedicalTreatment: { hasTreatment: false }, aspirinHerbal: { hasTaken: false }, smoker: { isSmoker: true, details: "10 sticks/day for 5 years" }, alcoholDrinker: { isDrinker: false } },
		},
		pastSurgicalHistory: {
		  surgeries: [],
		  familyAnesthesiaComplication: { hasComplication: false },
		},
		physicalExamination: {
		  vitals: { weightKg: 75, heightCm: 175, bmi: 24.5, bp: "120/75", hr: "70", rr: "16", temp: "36.7", spo2: "97%" },
		  findings: { general: "Awake, alert", heent: "Enlarged tonsils", chestLungs: "Clear", heart: "Normal", abdomen: "Normal", extremities: "Normal", neurologic: "Normal" },
		  laboratories: { hematology: { hgb: "150" } },
		},
		anesthesiaAssessment: {
		  airwayDental: { normal: true, mouthOpening: true, thyromentalDistance: true, mallampati: "III", fullNeckExtension: false, missingLooseTeeth: true, dentalCrownBridgeBraces: false, details: "Missing upper right molar" },
		},
		clinicalRiskAndPlan: {
		  asaScore: "II",
		  anestheticPlan: { generalAnesthesia: true },
		  medicalRiskAssessment: { pulmonary: "Mild risk due to smoking" },
		},
		confirmation: { dateTime: new Date("2024-07-20") },
		status: "Done",
		waitingTime: "3 days",
	  },
	  // Patient 4: Ana Lopez
  {
    patientInformation: { caseNumber: "PGH-004", patientLocation: "Labor Room", name: { last: "Lopez", first: "Ana", middle: "Santos" }, age: 37, sex: "Female", dateOfBirth: new Date("1987-03-30"), contactNo: "09201234567", address: "101 Aguinaldo Hi-way, Cavite", emergencyContact: { name: "Antonio Lopez", relationship: "Husband", contactNo: "09207654321" } },
    surgicalDetails: { surgicalService: { obGyn: true }, preOperativeDiagnosis: "G1P0 Pregnancy 39 weeks, Breech", proposedSurgicalPlan: "Primary Cesarean Section", estimatedBloodLoss: "500cc" },
    preOperativeHistory: { allergies: { hasAllergies: false }, cardiacPulmonary: { highBloodPressure: false, chestPain: false, irregularHeartBeat: false, heartDisease: false, heartAttack: false, difficultyOfBreathing: false, asthma: { hasAsthma: false }, pneumonia: false, copdPulmonaryTb: false }, gastrointestinalGenitourinary: { refluxHeartburn: true, hiatalHernia: false, gastricUlcer: false, liverDisease: false, kidneyDisease: false, pregnant: { isPregnant: true, lastMenstrualPeriod: "Approx. 9 months ago" } }, hematopoietic: { dvtBloodClots: false, bleedingTendency: false, anemia: true, bloodDisease: false }, endocrine: { diabetes: false, thyroidDisease: false }, neuropsychiatricMusculoskeletal: { stroke: { hasStroke: false }, seizures: false, psychiatricIllness: false, motionSickness: false, numbness: true, muscleWeakness: false, jointDisease: false }, otherInformation: { otherMedicalTreatment: { hasTreatment: false }, aspirinHerbal: { hasTaken: true, details: "Prenatal vitamins" }, smoker: { isSmoker: false }, alcoholDrinker: { isDrinker: false } } },
    pastSurgicalHistory: { surgeries: [{ date: new Date("2018-06-01"), procedure: "Dilation and Curettage", typeOfAnesthesia: "Sedation", complications: "None" }], familyAnesthesiaComplication: { hasComplication: false } },
    physicalExamination: { vitals: { weightKg: 70, heightCm: 158, bmi: 28.0, bp: "125/85", hr: "90", rr: "20", temp: "37.1", spo2: "99%" }, findings: { general: "Awake, anxious", heent: "Normal", chestLungs: "Clear", heart: "Normal", abdomen: "Gravid, striae present", extremities: "Trace pedal edema", neurologic: "Normal" }, laboratories: { hematology: { hgb: "110" } } },
    anesthesiaAssessment: { airwayDental: { normal: true, mouthOpening: true, thyromentalDistance: true, mallampati: "II", fullNeckExtension: true, missingLooseTeeth: false, dentalCrownBridgeBraces: false } },
    clinicalRiskAndPlan: { asaScore: "II", anestheticPlan: { regionalAnesthesia: true }, medicalRiskAssessment: {} },
    confirmation: { dateTime: new Date() },
    status: "Waiting",
    waitingTime: "5 days",
  },
  // Patient 5: Carlos Mendoza
  {
    patientInformation: { caseNumber: "PGH-005", patientLocation: "Ward 1", name: { last: "Mendoza", first: "Carlos", middle: "Cruz" }, age: 68, sex: "Male", dateOfBirth: new Date("1956-02-15"), contactNo: "09211234567", address: "22A Katipunan Ave, Quezon City", emergencyContact: { name: "Carla Mendoza", relationship: "Daughter", contactNo: "09217654321" }},
    surgicalDetails: { surgicalService: { urology: true }, preOperativeDiagnosis: "Benign Prostatic Hyperplasia", proposedSurgicalPlan: "Transurethral Resection of the Prostate (TURP)", estimatedBloodLoss: "150cc" },
    preOperativeHistory: { allergies: { hasAllergies: true, details: "Sulfa drugs - Hives" }, cardiacPulmonary: { highBloodPressure: true, chestPain: false, irregularHeartBeat: false, heartDisease: true, heartAttack: false, difficultyOfBreathing: false, asthma: { hasAsthma: false }, pneumonia: false, copdPulmonaryTb: false, medication: "Metformin, Amlodipine, Aspirin" }, gastrointestinalGenitourinary: { refluxHeartburn: false, hiatalHernia: false, gastricUlcer: false, liverDisease: false, kidneyDisease: false, pregnant: { isPregnant: false } }, hematopoietic: { dvtBloodClots: false, bleedingTendency: false, anemia: false, bloodDisease: false }, endocrine: { diabetes: true, thyroidDisease: false }, neuropsychiatricMusculoskeletal: { stroke: { hasStroke: false }, seizures: false, psychiatricIllness: false, motionSickness: false, numbness: false, muscleWeakness: false, jointDisease: true }, otherInformation: { otherMedicalTreatment: { hasTreatment: false }, aspirinHerbal: { hasTaken: true, details: "Daily low-dose Aspirin" }, smoker: { isSmoker: false }, alcoholDrinker: { isDrinker: false } }},
    pastSurgicalHistory: { surgeries: [], familyAnesthesiaComplication: { hasComplication: false } },
    physicalExamination: { vitals: { weightKg: 85, heightCm: 165, bmi: 31.2, bp: "140/90", hr: "75", rr: "18", temp: "36.5", spo2: "97%" }, findings: { general: "Awake, cooperative", heent: "Normal", chestLungs: "Clear", heart: "Normal", abdomen: "Normal", extremities: "Normal", neurologic: "Normal", ecg: "Left Ventricular Hypertrophy" }, laboratories: { hematology: { hgb: "135" }, biochemistry: { crea: "1.4", glu: "150" } } },
    anesthesiaAssessment: { airwayDental: { normal: true, mouthOpening: true, thyromentalDistance: true, mallampati: "II", fullNeckExtension: true, missingLooseTeeth: true, dentalCrownBridgeBraces: true, details: "Dental crown on upper incisor" } },
    clinicalRiskAndPlan: { asaScore: "III", anestheticPlan: { regionalAnesthesia: true }, medicalRiskAssessment: { cardiac: "Intermediate", othersRecommendations: "Monitor blood sugar post-op" } },
    confirmation: { dateTime: new Date() },
    status: "Waiting",
    waitingTime: "4 days",
  },
  // Patient 6: Sofia Chen
  {
    patientInformation: { caseNumber: "PGH-006", patientLocation: "Day Surgery Unit", name: { last: "Chen", first: "Sofia", middle: "Wu" }, age: 22, sex: "Female", dateOfBirth: new Date("2002-09-05"), contactNo: "09221234567", address: "33 Ongpin St, Binondo, Manila", emergencyContact: { name: "David Chen", relationship: "Father", contactNo: "09227654321" }},
    surgicalDetails: { surgicalService: { plasticSurgery: true }, preOperativeDiagnosis: "Deviated Nasal Septum", proposedSurgicalPlan: "Septorhinoplasty", estimatedBloodLoss: "50cc" },
    preOperativeHistory: { allergies: { hasAllergies: false }, cardiacPulmonary: { highBloodPressure: false, chestPain: false, irregularHeartBeat: false, heartDisease: false, heartAttack: false, difficultyOfBreathing: false, asthma: { hasAsthma: false }, pneumonia: false, copdPulmonaryTb: false }, gastrointestinalGenitourinary: { refluxHeartburn: false, hiatalHernia: false, gastricUlcer: false, liverDisease: false, kidneyDisease: false, pregnant: { isPregnant: false } }, hematopoietic: { dvtBloodClots: false, bleedingTendency: false, anemia: false, bloodDisease: false }, endocrine: { diabetes: false, thyroidDisease: false }, neuropsychiatricMusculoskeletal: { stroke: { hasStroke: false }, seizures: false, psychiatricIllness: false, motionSickness: false, numbness: false, muscleWeakness: false, jointDisease: false }, otherInformation: { otherMedicalTreatment: { hasTreatment: false }, aspirinHerbal: { hasTaken: false }, smoker: { isSmoker: false }, alcoholDrinker: { isDrinker: false } }},
    pastSurgicalHistory: { surgeries: [], familyAnesthesiaComplication: { hasComplication: true, specify: "Brother had a high fever and muscle rigidity after receiving anesthesia (suspected Malignant Hyperthermia)." } },
    physicalExamination: { vitals: { weightKg: 50, heightCm: 162, bmi: 19.1, bp: "100/60", hr: "70", rr: "14", temp: "36.6", spo2: "100%" }, findings: { general: "Fit and healthy", heent: "Nasal deviation noted", chestLungs: "Clear", heart: "Normal", abdomen: "Normal", extremities: "Normal", neurologic: "Normal" }, laboratories: {} },
    anesthesiaAssessment: { airwayDental: { normal: true, mouthOpening: true, thyromentalDistance: true, mallampati: "I", fullNeckExtension: true, missingLooseTeeth: false, dentalCrownBridgeBraces: false } },
    clinicalRiskAndPlan: { asaScore: "I", anestheticPlan: { tiva: true }, medicalRiskAssessment: { othersRecommendations: "Malignant Hyperthermia precautions. Avoid triggering agents like succinylcholine and volatile anesthetics. Prepare Dantrolene." } },
    confirmation: { dateTime: new Date() },
    status: "In Process",
    waitingTime: "6 hours",
  },

  // Patient 7: Elena Rodriguez - High-risk cardiac patient
  {
    patientInformation: { caseNumber: "PGH-007", patientLocation: "ICU", name: { last: "Rodriguez", first: "Elena", middle: "Villanueva" }, age: 62, sex: "Female", dateOfBirth: new Date("1962-07-18"), contactNo: "09281234567", address: "44 Ayala Ave, Makati", emergencyContact: { name: "Eduardo Rodriguez", relationship: "Son", contactNo: "09287654321" } },
    surgicalDetails: { surgicalService: { tcvs: true }, preOperativeDiagnosis: "Severe Coronary Artery Disease", proposedSurgicalPlan: "Coronary Artery Bypass Graft (CABG) x3", estimatedBloodLoss: "800cc" },
    preOperativeHistory: {
        allergies: { hasAllergies: false },
        cardiacPulmonary: { highBloodPressure: true, chestPain: true, irregularHeartBeat: true, heartDisease: true, heartAttack: true, difficultyOfBreathing: true, asthma: { hasAsthma: false }, pneumonia: false, copdPulmonaryTb: false, medication: "Aspirin, Clopidogrel, Atorvastatin, Metoprolol" },
        gastrointestinalGenitourinary: { refluxHeartburn: false, hiatalHernia: false, gastricUlcer: false, liverDisease: false, kidneyDisease: false, pregnant: { isPregnant: false } },
        hematopoietic: { dvtBloodClots: false, bleedingTendency: false, anemia: false, bloodDisease: false },
        endocrine: { diabetes: true, thyroidDisease: false },
        neuropsychiatricMusculoskeletal: { stroke: { hasStroke: true, when: "2020" }, seizures: false, psychiatricIllness: false, motionSickness: false, numbness: false, muscleWeakness: false, jointDisease: true },
        otherInformation: { otherMedicalTreatment: { hasTreatment: false }, aspirinHerbal: { hasTaken: true }, smoker: { isSmoker: true, details: "1 pack/day for 30 years" }, alcoholDrinker: { isDrinker: false } },
    },
    pastSurgicalHistory: { surgeries: [{ date: new Date("2015-03-10"), procedure: "Angioplasty with Stent", typeOfAnesthesia: "Sedation", complications: "None" }], familyAnesthesiaComplication: { hasComplication: false } },
    physicalExamination: { vitals: { weightKg: 65, heightCm: 155, bmi: 27.1, bp: "110/70", hr: "60", rr: "20", temp: "36.8", spo2: "95%" }, findings: { general: "Lethargic but arousable", heent: "Normal", chestLungs: "Basal crackles", heart: "Distant heart sounds", abdomen: "Normal", extremities: "Cold, clammy, trace edema", neurologic: "Slight left-sided weakness", ecg: "Q waves in inferior leads, Atrial Fibrillation" } , laboratories: { hematology: { hgb: "120" }, biochemistry: { crea: "1.8", bun: "30" } } },
    anesthesiaAssessment: { airwayDental: { normal: true, mouthOpening: true, thyromentalDistance: true, mallampati: "II", fullNeckExtension: false, missingLooseTeeth: true, dentalCrownBridgeBraces: false } },
    clinicalRiskAndPlan: { asaScore: "IV", anestheticPlan: { combinedGaRa: true }, medicalRiskAssessment: { cardiac: "Major", pulmonary: "High risk", othersRecommendations: "Post-op ICU monitoring required. Prepare for massive transfusion." } },
    confirmation: { dateTime: new Date() },
    status: "For Surgery",
    waitingTime: "12 hours",
  },

  // Patient 8: Ben Carter - Pediatric case
  {
    patientInformation: { caseNumber: "PGH-008", patientLocation: "Pedia Ward", name: { last: "Carter", first: "Ben", middle: "Smith" }, age: 8, sex: "Male", dateOfBirth: new Date("2016-10-01"), contactNo: "09331234567", address: "55 Grove St, BGC, Taguig", emergencyContact: { name: "Brenda Carter", relationship: "Mother", contactNo: "09337654321" } },
    surgicalDetails: { surgicalService: { burn: true }, preOperativeDiagnosis: "2nd Degree Burn, Left Forearm", proposedSurgicalPlan: "Wound Debridement and Dressing", estimatedBloodLoss: "Minimal" },
    preOperativeHistory: {
        allergies: { hasAllergies: false },
        cardiacPulmonary: { highBloodPressure: false, chestPain: false, irregularHeartBeat: false, heartDisease: false, heartAttack: false, difficultyOfBreathing: false, asthma: { hasAsthma: true, lastAttack: "Over a year ago" }, pneumonia: false, copdPulmonaryTb: false },
        gastrointestinalGenitourinary: { refluxHeartburn: false, hiatalHernia: false, gastricUlcer: false, liverDisease: false, kidneyDisease: false, pregnant: { isPregnant: false } },
        hematopoietic: { dvtBloodClots: false, bleedingTendency: false, anemia: false, bloodDisease: false },
        endocrine: { diabetes: false, thyroidDisease: false },
        neuropsychiatricMusculoskeletal: { stroke: { hasStroke: false }, seizures: false, psychiatricIllness: false, motionSickness: false, numbness: false, muscleWeakness: false, jointDisease: false },
        otherInformation: { otherMedicalTreatment: { hasTreatment: false }, aspirinHerbal: { hasTaken: false }, smoker: { isSmoker: false }, alcoholDrinker: { isDrinker: false } },
    },
    pastSurgicalHistory: { surgeries: [], familyAnesthesiaComplication: { hasComplication: false } },
    physicalExamination: { vitals: { weightKg: 25, heightCm: 128, bmi: 15.3, bp: "95/60", hr: "100", rr: "22", temp: "37.0", spo2: "99%" }, findings: { general: "Alert, playful, anxious", heent: "Normal", chestLungs: "Clear", heart: "Normal", abdomen: "Normal", extremities: "Burn wound on left forearm, no other abnormalities", neurologic: "Normal" }, laboratories: {} },
    anesthesiaAssessment: { airwayDental: { normal: true, mouthOpening: true, thyromentalDistance: true, mallampati: "I", fullNeckExtension: true, missingLooseTeeth: false, dentalCrownBridgeBraces: false } },
    clinicalRiskAndPlan: { asaScore: "II", anestheticPlan: { generalAnesthesia: true }, medicalRiskAssessment: { othersRecommendations: "Parental presence during induction may be helpful." } },
    confirmation: { dateTime: new Date() },
    status: "Waiting",
    waitingTime: "2 hours",
  }
]

export default surveyData