export interface University {
  id?: string;
  user_id?: string;
  name: string;
  country: string;
  city?: string;
  program_name?: string;
  degree_type: string;
  field_of_study?: string;
  tuition_per_year?: number;
  living_cost_per_year?: number;
  category: "dream" | "target" | "safe";
  acceptance_likelihood?: "low" | "medium" | "high";
  fit_explanation?: string;
  risk_explanation?: string;
  requirements_summary?: string;
  is_shortlisted?: boolean;
  is_locked?: boolean;
  locked_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UniversityFilters {
  country?: string;
  category?: "dream" | "target" | "safe";
  maxBudget?: number;
  degreeType?: string;
  field?: string;
  intakeYear?: number;
  competitionLevel?: "low" | "medium" | "high";
}

export const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  UK: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  NL: "Netherlands",
  IE: "Ireland",
  FR: "France",
  NZ: "New Zealand",
  SG: "Singapore",
};

export const CATEGORY_INFO = {
  dream: {
    label: "Dream",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    description: "Reach schools with lower acceptance chance",
  },
  target: {
    label: "Target",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    description: "Good fit with reasonable acceptance chance",
  },
  safe: {
    label: "Safe",
    color: "bg-green-100 text-green-700 border-green-200",
    description: "Likely admission, solid backup options",
  },
};

export const LIKELIHOOD_INFO = {
  low: { label: "Low", color: "text-orange-600" },
  medium: { label: "Medium", color: "text-blue-600" },
  high: { label: "High", color: "text-green-600" },
};
