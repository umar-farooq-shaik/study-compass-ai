import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EDUCATION_LEVELS } from "@/types/profile";
import type { OnboardingFormData } from "@/types/profile";

interface AcademicBackgroundStepProps {
  formData: OnboardingFormData;
  updateField: (field: keyof OnboardingFormData, value: string | string[]) => void;
  errors: Record<string, string>;
}

export function AcademicBackgroundStep({ formData, updateField, errors }: AcademicBackgroundStepProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear - 10 + i);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-bold">Academic Background</h2>
        <p className="text-muted-foreground">
          Tell us about your educational background to help us recommend suitable universities.
        </p>
      </div>

      {/* Education Level */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Current Education Level <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          value={formData.education_level}
          onValueChange={(value) => updateField("education_level", value)}
          className="grid grid-cols-2 gap-3"
        >
          {EDUCATION_LEVELS.map((level) => (
            <div key={level.value}>
              <RadioGroupItem
                value={level.value}
                id={level.value}
                className="peer sr-only"
              />
              <Label
                htmlFor={level.value}
                className="flex items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-foreground peer-data-[state=checked]:hover:bg-accent peer-data-[state=checked]:hover:text-accent-foreground cursor-pointer transition-all"
              >
                {level.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.education_level && (
          <p className="text-sm text-destructive">{errors.education_level}</p>
        )}
      </div>

      {/* Degree / Major */}
      <div className="space-y-3">
        <Label htmlFor="degree_major" className="text-base font-medium">
          Degree / Major <span className="text-destructive">*</span>
        </Label>
        <Input
          id="degree_major"
          value={formData.degree_major}
          onChange={(e) => updateField("degree_major", e.target.value)}
          placeholder="e.g., Bachelor of Science in Computer Science"
          className={errors.degree_major ? "border-destructive" : ""}
        />
        {errors.degree_major && (
          <p className="text-sm text-destructive">{errors.degree_major}</p>
        )}
      </div>

      {/* Graduation Year */}
      <div className="space-y-3">
        <Label htmlFor="graduation_year" className="text-base font-medium">
          Graduation Year (Expected) <span className="text-destructive">*</span>
        </Label>
        <select
          id="graduation_year"
          value={formData.graduation_year}
          onChange={(e) => updateField("graduation_year", e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">Select year</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        {errors.graduation_year && (
          <p className="text-sm text-destructive">{errors.graduation_year}</p>
        )}
      </div>

      {/* GPA / Percentage */}
      <div className="space-y-3">
        <Label htmlFor="gpa_percentage" className="text-base font-medium">
          GPA or Percentage <span className="text-destructive">*</span>
        </Label>
        <Input
          id="gpa_percentage"
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={formData.gpa_percentage}
          onChange={(e) => updateField("gpa_percentage", e.target.value)}
          placeholder="e.g., 3.8 (GPA) or 85 (Percentage)"
          className={errors.gpa_percentage ? "border-destructive" : ""}
        />
        <p className="text-xs text-muted-foreground">
          Enter your GPA (0-4 scale) or percentage (0-100)
        </p>
        {errors.gpa_percentage && (
          <p className="text-sm text-destructive">{errors.gpa_percentage}</p>
        )}
      </div>
    </div>
  );
}
