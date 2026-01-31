import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { AcademicBackgroundStep } from "@/components/onboarding/steps/AcademicBackgroundStep";
import { StudyGoalsStep } from "@/components/onboarding/steps/StudyGoalsStep";
import { BudgetStep } from "@/components/onboarding/steps/BudgetStep";
import { ExamsReadinessStep } from "@/components/onboarding/steps/ExamsReadinessStep";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, ArrowLeft, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { OnboardingFormData } from "@/types/profile";

const STEPS = [
  { label: "Academic", description: "Your background" },
  { label: "Goals", description: "Study plans" },
  { label: "Budget", description: "Financial planning" },
  { label: "Readiness", description: "Exams & prep" },
];

type ValidationErrors = Partial<Record<keyof OnboardingFormData, string>>;

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    currentStep,
    totalSteps,
    formData,
    updateField,
    nextStep,
    prevStep,
    completeOnboarding,
    loading,
    saving,
  } = useOnboarding();

  const [errors, setErrors] = useState<ValidationErrors>({});

  // Check auth state
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?mode=login");
      }
    };
    checkAuth();
  }, [navigate]);

  const validateStep = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (currentStep === 1) {
      if (!formData.education_level) newErrors.education_level = "Please select your education level";
      if (!formData.degree_major) newErrors.degree_major = "Please enter your degree or major";
      if (!formData.graduation_year) newErrors.graduation_year = "Please select your graduation year";
      if (!formData.gpa_percentage) newErrors.gpa_percentage = "Please enter your GPA or percentage";
    }

    if (currentStep === 2) {
      if (!formData.intended_degree) newErrors.intended_degree = "Please select your intended degree";
      if (!formData.field_of_study) newErrors.field_of_study = "Please select your field of study";
      if (!formData.target_intake_year) newErrors.target_intake_year = "Please select your target intake year";
      if (formData.preferred_countries.length === 0) newErrors.preferred_countries = "Please select at least one country";
    }

    if (currentStep === 3) {
      if (!formData.budget_min) newErrors.budget_min = "Please enter your minimum budget";
      if (!formData.budget_max) newErrors.budget_max = "Please enter your maximum budget";
      if (formData.budget_min && formData.budget_max && parseInt(formData.budget_min) > parseInt(formData.budget_max)) {
        newErrors.budget_max = "Maximum budget must be greater than minimum";
      }
      if (!formData.funding_plan) newErrors.funding_plan = "Please select your funding plan";
    }

    if (currentStep === 4) {
      if (!formData.ielts_toefl_status) newErrors.ielts_toefl_status = "Please select your IELTS/TOEFL status";
      if (!formData.gre_gmat_status) newErrors.gre_gmat_status = "Please select your GRE/GMAT status";
      if (!formData.sop_status) newErrors.sop_status = "Please select your SOP status";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    await nextStep();
    setErrors({});
  };

  const handleComplete = async () => {
    if (!validateStep()) return;
    
    const success = await completeOnboarding();
    if (success) {
      toast({
        title: "Profile Complete! 🎉",
        description: "You're all set to start exploring universities.",
      });
      navigate("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">AI Counsellor</span>
          </Link>
          <div className="text-sm text-muted-foreground">
            Complete your profile to continue
          </div>
        </div>
      </header>

      <main className="container py-8 lg:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <OnboardingProgress
            currentStep={currentStep}
            totalSteps={totalSteps}
            steps={STEPS}
          />

          {/* Form Card */}
          <Card className="mt-8 p-6 lg:p-8">
            {currentStep === 1 && (
              <AcademicBackgroundStep
                formData={formData}
                updateField={updateField}
                errors={errors}
              />
            )}
            {currentStep === 2 && (
              <StudyGoalsStep
                formData={formData}
                updateField={updateField}
                errors={errors}
              />
            )}
            {currentStep === 3 && (
              <BudgetStep
                formData={formData}
                updateField={updateField}
                errors={errors}
              />
            )}
            {currentStep === 4 && (
              <ExamsReadinessStep
                formData={formData}
                updateField={updateField}
                errors={errors}
              />
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-10 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || saving}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button onClick={handleNext} disabled={saving} className="gap-2">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={saving} className="gap-2 bg-success hover:bg-success/90">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Complete Profile
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>

          {/* Help Text */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Your progress is automatically saved. You can return anytime to continue.
          </p>
        </div>
      </main>
    </div>
  );
}
