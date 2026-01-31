import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { INTENDED_DEGREES, INTAKE_TERMS, COUNTRIES, FIELDS_OF_STUDY } from "@/types/profile";
import type { OnboardingFormData } from "@/types/profile";

interface StudyGoalsStepProps {
  formData: OnboardingFormData;
  updateField: (field: keyof OnboardingFormData, value: string | string[]) => void;
  errors: Record<string, string>;
}

export function StudyGoalsStep({ formData, updateField, errors }: StudyGoalsStepProps) {
  const currentYear = new Date().getFullYear();
  const intakeYears = Array.from({ length: 5 }, (_, i) => currentYear + i);

  const toggleCountry = (country: string) => {
    const current = formData.preferred_countries;
    if (current.includes(country)) {
      updateField("preferred_countries", current.filter((c) => c !== country));
    } else {
      updateField("preferred_countries", [...current, country]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-bold">Study Goals</h2>
        <p className="text-muted-foreground">
          Help us understand what you're looking for in your study abroad journey.
        </p>
      </div>

      {/* Intended Degree */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Intended Degree <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          value={formData.intended_degree}
          onValueChange={(value) => updateField("intended_degree", value)}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {INTENDED_DEGREES.map((degree) => (
            <div key={degree.value}>
              <RadioGroupItem
                value={degree.value}
                id={`degree-${degree.value}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`degree-${degree.value}`}
                className="flex items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-foreground peer-data-[state=checked]:hover:bg-accent peer-data-[state=checked]:hover:text-accent-foreground cursor-pointer transition-all"
              >
                {degree.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.intended_degree && (
          <p className="text-sm text-destructive">{errors.intended_degree}</p>
        )}
      </div>

      {/* Field of Study */}
      <div className="space-y-3">
        <Label htmlFor="field_of_study" className="text-base font-medium">
          Field of Study <span className="text-destructive">*</span>
        </Label>
        <select
          id="field_of_study"
          value={formData.field_of_study}
          onChange={(e) => updateField("field_of_study", e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">Select field of study</option>
          {FIELDS_OF_STUDY.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
        {errors.field_of_study && (
          <p className="text-sm text-destructive">{errors.field_of_study}</p>
        )}
      </div>

      {/* Target Intake */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="target_intake_year" className="text-base font-medium">
            Target Intake Year <span className="text-destructive">*</span>
          </Label>
          <select
            id="target_intake_year"
            value={formData.target_intake_year}
            onChange={(e) => updateField("target_intake_year", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Select year</option>
            {intakeYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {errors.target_intake_year && (
            <p className="text-sm text-destructive">{errors.target_intake_year}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">Intake Term (Optional)</Label>
          <RadioGroup
            value={formData.target_intake_term}
            onValueChange={(value) => updateField("target_intake_term", value)}
            className="flex gap-3"
          >
            {INTAKE_TERMS.map((term) => (
              <div key={term.value}>
                <RadioGroupItem
                  value={term.value}
                  id={`term-${term.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`term-${term.value}`}
                  className="flex items-center justify-center rounded-lg border-2 border-muted bg-popover px-4 py-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-foreground peer-data-[state=checked]:hover:bg-accent peer-data-[state=checked]:hover:text-accent-foreground cursor-pointer transition-all text-sm"
                >
                  {term.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      {/* Preferred Countries */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Preferred Countries <span className="text-destructive">*</span>
          <span className="text-sm font-normal text-muted-foreground ml-2">
            (Select at least one)
          </span>
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {COUNTRIES.map((country) => (
            <div
              key={country.value}
              className={`flex items-center space-x-2 rounded-lg border-2 p-3 cursor-pointer transition-all ${
                formData.preferred_countries.includes(country.value)
                  ? "border-primary bg-primary/5 text-foreground hover:bg-accent hover:text-accent-foreground"
                  : "border-muted hover:bg-accent hover:text-accent-foreground"
              }`}
              onClick={() => toggleCountry(country.value)}
            >
              <Checkbox
                id={`country-${country.value}`}
                checked={formData.preferred_countries.includes(country.value)}
                onCheckedChange={() => toggleCountry(country.value)}
              />
              <Label
                htmlFor={`country-${country.value}`}
                className="cursor-pointer text-sm"
              >
                {country.label}
              </Label>
            </div>
          ))}
        </div>
        {errors.preferred_countries && (
          <p className="text-sm text-destructive">{errors.preferred_countries}</p>
        )}
      </div>
    </div>
  );
}
