import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EXAM_STATUSES, SOP_STATUSES } from "@/types/profile";
import type { OnboardingFormData } from "@/types/profile";
import { FileText, BookOpen, PenTool } from "lucide-react";

interface ExamsReadinessStepProps {
  formData: OnboardingFormData;
  updateField: (field: keyof OnboardingFormData, value: string | string[]) => void;
  errors: Record<string, string>;
}

export function ExamsReadinessStep({ formData, updateField, errors }: ExamsReadinessStepProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-bold">Exams & Readiness</h2>
        <p className="text-muted-foreground">
          Let us know your exam preparation status and application readiness.
        </p>
      </div>

      {/* IELTS / TOEFL */}
      <div className="space-y-4 p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">IELTS / TOEFL</h3>
            <p className="text-sm text-muted-foreground">English proficiency test</p>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Status <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={formData.ielts_toefl_status}
            onValueChange={(value) => updateField("ielts_toefl_status", value)}
            className="flex flex-wrap gap-3"
          >
            {EXAM_STATUSES.map((status) => (
              <div key={status.value}>
                <RadioGroupItem
                  value={status.value}
                  id={`ielts-${status.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`ielts-${status.value}`}
                  className="flex items-center justify-center rounded-lg border-2 border-muted bg-popover px-4 py-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-foreground peer-data-[state=checked]:hover:bg-accent peer-data-[state=checked]:hover:text-accent-foreground cursor-pointer transition-all text-sm"
                >
                  {status.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.ielts_toefl_status && (
            <p className="text-sm text-destructive">{errors.ielts_toefl_status}</p>
          )}
        </div>

        {formData.ielts_toefl_status === "taken" && (
          <div className="space-y-2">
            <Label htmlFor="ielts_toefl_score" className="text-sm font-medium">
              Score (Optional)
            </Label>
            <Input
              id="ielts_toefl_score"
              type="number"
              step="0.5"
              min="0"
              max="9"
              value={formData.ielts_toefl_score}
              onChange={(e) => updateField("ielts_toefl_score", e.target.value)}
              placeholder="e.g., 7.5 (IELTS)"
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              IELTS: 0-9 scale | TOEFL: Enter equivalent IELTS score
            </p>
          </div>
        )}
      </div>

      {/* GRE / GMAT */}
      <div className="space-y-4 p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold">GRE / GMAT</h3>
            <p className="text-sm text-muted-foreground">Graduate admission test</p>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Status <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={formData.gre_gmat_status}
            onValueChange={(value) => updateField("gre_gmat_status", value)}
            className="flex flex-wrap gap-3"
          >
            {EXAM_STATUSES.map((status) => (
              <div key={status.value}>
                <RadioGroupItem
                  value={status.value}
                  id={`gre-${status.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`gre-${status.value}`}
                  className="flex items-center justify-center rounded-lg border-2 border-muted bg-popover px-4 py-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-foreground peer-data-[state=checked]:hover:bg-accent peer-data-[state=checked]:hover:text-accent-foreground cursor-pointer transition-all text-sm"
                >
                  {status.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.gre_gmat_status && (
            <p className="text-sm text-destructive">{errors.gre_gmat_status}</p>
          )}
        </div>

        {formData.gre_gmat_status === "taken" && (
          <div className="space-y-2">
            <Label htmlFor="gre_gmat_score" className="text-sm font-medium">
              Score (Optional)
            </Label>
            <Input
              id="gre_gmat_score"
              type="number"
              min="0"
              max="340"
              value={formData.gre_gmat_score}
              onChange={(e) => updateField("gre_gmat_score", e.target.value)}
              placeholder="e.g., 320 (GRE)"
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              GRE: 260-340 | GMAT: 200-800
            </p>
          </div>
        )}
      </div>

      {/* SOP Status */}
      <div className="space-y-4 p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
            <PenTool className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Statement of Purpose (SOP)</h3>
            <p className="text-sm text-muted-foreground">Your application essay</p>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Status <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={formData.sop_status}
            onValueChange={(value) => updateField("sop_status", value)}
            className="grid md:grid-cols-3 gap-3"
          >
            {SOP_STATUSES.map((status) => (
              <div key={status.value}>
                <RadioGroupItem
                  value={status.value}
                  id={`sop-${status.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`sop-${status.value}`}
                  className="flex items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-foreground peer-data-[state=checked]:hover:bg-accent peer-data-[state=checked]:hover:text-accent-foreground cursor-pointer transition-all"
                >
                  {status.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.sop_status && (
            <p className="text-sm text-destructive">{errors.sop_status}</p>
          )}
        </div>
      </div>
    </div>
  );
}
