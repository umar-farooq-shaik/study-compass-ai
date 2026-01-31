export interface Profile {
  id: string;
  user_id: string;
  
  // Academic Background
  education_level: string | null;
  degree_major: string | null;
  graduation_year: number | null;
  gpa_percentage: number | null;
  
  // Study Goals
  intended_degree: string | null;
  field_of_study: string | null;
  target_intake_year: number | null;
  target_intake_term: string | null;
  preferred_countries: string[] | null;
  
  // Budget
  budget_min: number | null;
  budget_max: number | null;
  funding_plan: string | null;
  
  // Exams & Readiness
  ielts_toefl_status: string | null;
  ielts_toefl_score: number | null;
  gre_gmat_status: string | null;
  gre_gmat_score: number | null;
  sop_status: string | null;
  
  // Meta
  onboarding_completed: boolean;
  onboarding_step: number;
  current_stage: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingFormData {
  // Step 1: Academic Background
  education_level: string;
  degree_major: string;
  graduation_year: string;
  gpa_percentage: string;
  
  // Step 2: Study Goals
  intended_degree: string;
  field_of_study: string;
  target_intake_year: string;
  target_intake_term: string;
  preferred_countries: string[];
  
  // Step 3: Budget
  budget_min: string;
  budget_max: string;
  funding_plan: string;
  
  // Step 4: Exams & Readiness
  ielts_toefl_status: string;
  ielts_toefl_score: string;
  gre_gmat_status: string;
  gre_gmat_score: string;
  sop_status: string;
}

export const EDUCATION_LEVELS = [
  { value: "high_school", label: "High School" },
  { value: "bachelors", label: "Bachelor's Degree" },
  { value: "masters", label: "Master's Degree" },
  { value: "other", label: "Other" },
];

export const INTENDED_DEGREES = [
  { value: "bachelors", label: "Bachelor's" },
  { value: "masters", label: "Master's" },
  { value: "mba", label: "MBA" },
  { value: "phd", label: "PhD" },
];

export const INTAKE_TERMS = [
  { value: "fall", label: "Fall" },
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
];

export const FUNDING_PLANS = [
  { value: "self_funded", label: "Self-funded" },
  { value: "scholarship_dependent", label: "Scholarship-dependent" },
  { value: "loan_dependent", label: "Loan-dependent" },
];

export const EXAM_STATUSES = [
  { value: "not_planned", label: "Not Planned" },
  { value: "planned", label: "Planned" },
  { value: "taken", label: "Taken" },
];

export const SOP_STATUSES = [
  { value: "not_started", label: "Not Started" },
  { value: "draft", label: "Draft Ready" },
  { value: "ready", label: "Ready to Submit" },
];

export const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "NL", label: "Netherlands" },
  { value: "IE", label: "Ireland" },
  { value: "FR", label: "France" },
  { value: "NZ", label: "New Zealand" },
  { value: "SG", label: "Singapore" },
];

export const FIELDS_OF_STUDY = [
  "Computer Science",
  "Data Science",
  "Business Administration",
  "Finance",
  "Marketing",
  "Engineering",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Medicine",
  "Public Health",
  "Psychology",
  "Economics",
  "Law",
  "Architecture",
  "Environmental Science",
  "Biotechnology",
  "Pharmacy",
  "Education",
  "Arts & Design",
  "Other",
];
