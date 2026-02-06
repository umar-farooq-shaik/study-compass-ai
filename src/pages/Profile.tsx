import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { ProfileStrengthCard } from "@/components/profile/ProfileStrengthCard";
import { AcademicBackgroundStep } from "@/components/onboarding/steps/AcademicBackgroundStep";
import { StudyGoalsStep } from "@/components/onboarding/steps/StudyGoalsStep";
import { BudgetStep } from "@/components/onboarding/steps/BudgetStep";
import { ExamsReadinessStep } from "@/components/onboarding/steps/ExamsReadinessStep";
import { useProfileEditor } from "@/hooks/useProfileEditor";
import { useResetUserData } from "@/hooks/useResetUserData";
import {
  GraduationCap,
  Target,
  Wallet,
  FileText,
  Save,
  RotateCcw,
  Loader2,
  AlertTriangle,
  Trash2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Profile() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const {
    profile,
    formData,
    errors,
    loading,
    saving,
    hasChanges,
    updateField,
    saveProfile,
    discardChanges,
  } = useProfileEditor();
  const { resetUserData, isResetting } = useResetUserData();

  const handleResetData = async () => {
    const success = await resetUserData();
    if (success) navigate("/onboarding", { replace: true });
  };

  // Check auth first – don't render profile content until we know user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?mode=login", { replace: true });
        return;
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, [navigate]);

  if (!authChecked) {
    return (
      <Layout isAuthenticated>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout isAuthenticated>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAuthenticated currentStage={profile?.current_stage}>
      <ErrorBoundary>
        <div className="container py-8 lg:py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold">Edit Profile</h1>
              <p className="text-muted-foreground mt-1">
                Keep your information up-to-date for better recommendations
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {hasChanges && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Discard
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-warning" />
                        Discard Changes?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        You have unsaved changes. Are you sure you want to discard them?
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Editing</AlertDialogCancel>
                      <AlertDialogAction onClick={discardChanges}>
                        Discard Changes
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button
                onClick={saveProfile}
                disabled={!hasChanges || saving}
                className="gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Unsaved Changes Banner */}
          {hasChanges && (
            <div className="mb-6 p-4 rounded-lg bg-warning/10 border border-warning/30 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
              <p className="text-sm text-warning-foreground">
                You have unsaved changes. Don't forget to save before leaving this page.
              </p>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Strength Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <ProfileStrengthCard profile={profile} />

              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <h3 className="font-medium mb-2">💡 Pro Tip</h3>
                <p className="text-sm text-muted-foreground">
                  A complete profile helps our AI provide more accurate university
                  recommendations and personalized guidance.
                </p>
              </div>
            </div>

            {/* Form Sections */}
            <div className="lg:col-span-2 space-y-6">
              <ProfileSection
                title="Academic Background"
                description="Your educational history and achievements"
                icon={GraduationCap}
              >
                <AcademicBackgroundStep
                  formData={formData}
                  updateField={updateField}
                  errors={errors}
                />
              </ProfileSection>

              <ProfileSection
                title="Study Goals"
                description="Your aspirations and target destinations"
                icon={Target}
              >
                <StudyGoalsStep
                  formData={formData}
                  updateField={updateField}
                  errors={errors}
                />
              </ProfileSection>

              <ProfileSection
                title="Budget & Funding"
                description="Your financial planning for studies"
                icon={Wallet}
              >
                <BudgetStep
                  formData={formData}
                  updateField={updateField}
                  errors={errors}
                />
              </ProfileSection>

              <ProfileSection
                title="Exams & Readiness"
                description="Your test preparation and application status"
                icon={FileText}
              >
                <ExamsReadinessStep
                  formData={formData}
                  updateField={updateField}
                  errors={errors}
                />
              </ProfileSection>
            </div>
          </div>

          {/* Reset my data - delete profile data, universities, tasks */}
          <Card className="mt-8 border-destructive/30 bg-destructive/5">
            <div className="p-6">
              <h3 className="font-semibold text-destructive flex items-center gap-2 mb-2">
                <Trash2 className="h-5 w-5" />
                Reset my data
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Delete all your profile data, shortlisted universities, and application tasks. You will be sent back to onboarding to create a new profile. Only AI-generated data will appear after you generate recommendations and tasks again.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isResetting} className="gap-2">
                    {isResetting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete my data and reset profile
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Delete all my data?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your profile data, all shortlisted universities, and all application tasks. You will need to complete onboarding again. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleResetData}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, delete my data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>

          {/* Floating Save Button for Mobile */}
          {hasChanges && (
            <div className="fixed bottom-6 right-6 lg:hidden">
              <Button
                onClick={saveProfile}
                disabled={saving}
                size="lg"
                className="gap-2 shadow-lg"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </Button>
            </div>
          )}
        </div>
      </ErrorBoundary>
    </Layout>
  );
}
