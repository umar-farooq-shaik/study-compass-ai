import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FUNDING_PLANS } from "@/types/profile";
import type { OnboardingFormData } from "@/types/profile";
import { DollarSign, Wallet, GraduationCap, Landmark } from "lucide-react";

interface BudgetStepProps {
  formData: OnboardingFormData;
  updateField: (field: keyof OnboardingFormData, value: string | string[]) => void;
  errors: Record<string, string>;
}

const fundingIcons = {
  self_funded: Wallet,
  scholarship_dependent: GraduationCap,
  loan_dependent: Landmark,
};

export function BudgetStep({ formData, updateField, errors }: BudgetStepProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-bold">Budget & Funding</h2>
        <p className="text-muted-foreground">
          Understanding your budget helps us recommend universities that fit your financial situation.
        </p>
      </div>

      {/* Budget Range */}
      <div className="space-y-4">
        <Label className="text-base font-medium">
          Annual Budget Range (USD) <span className="text-destructive">*</span>
        </Label>
        <p className="text-sm text-muted-foreground">
          Include tuition and living expenses per year
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budget_min" className="text-sm">Minimum Budget</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="budget_min"
                type="number"
                min="0"
                step="1000"
                value={formData.budget_min}
                onChange={(e) => updateField("budget_min", e.target.value)}
                placeholder="20000"
                className={`pl-9 ${errors.budget_min ? "border-destructive" : ""}`}
              />
            </div>
            {errors.budget_min && (
              <p className="text-sm text-destructive">{errors.budget_min}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="budget_max" className="text-sm">Maximum Budget</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="budget_max"
                type="number"
                min="0"
                step="1000"
                value={formData.budget_max}
                onChange={(e) => updateField("budget_max", e.target.value)}
                placeholder="60000"
                className={`pl-9 ${errors.budget_max ? "border-destructive" : ""}`}
              />
            </div>
            {errors.budget_max && (
              <p className="text-sm text-destructive">{errors.budget_max}</p>
            )}
          </div>
        </div>

        {/* Budget Guide */}
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm font-medium mb-2">Budget Guide (per year)</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• $20,000 - $35,000: Affordable options in Germany, Netherlands, Canada</li>
            <li>• $35,000 - $55,000: Mid-range universities in UK, Australia, US</li>
            <li>• $55,000+: Premium universities, Ivy League, top UK schools</li>
          </ul>
        </div>
      </div>

      {/* Funding Plan */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Funding Plan <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          value={formData.funding_plan}
          onValueChange={(value) => updateField("funding_plan", value)}
          className="grid md:grid-cols-3 gap-4"
        >
          {FUNDING_PLANS.map((plan) => {
            const Icon = fundingIcons[plan.value as keyof typeof fundingIcons];
            return (
              <div key={plan.value}>
                <RadioGroupItem
                  value={plan.value}
                  id={`funding-${plan.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`funding-${plan.value}`}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-foreground peer-data-[state=checked]:hover:bg-accent peer-data-[state=checked]:hover:text-accent-foreground cursor-pointer transition-all"
                >
                  <Icon className="h-8 w-8 mb-3 text-primary" />
                  <span className="font-medium text-center">{plan.label}</span>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
        {errors.funding_plan && (
          <p className="text-sm text-destructive">{errors.funding_plan}</p>
        )}
      </div>
    </div>
  );
}
