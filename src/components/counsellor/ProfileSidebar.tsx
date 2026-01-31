import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Target,
  Wallet,
  FileCheck,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import type { Profile } from "@/types/profile";
import { COUNTRIES, INTENDED_DEGREES } from "@/types/profile";

interface ProfileSidebarProps {
  profile: Profile | null;
}

function getStatusIcon(status: string | null) {
  if (!status) return <AlertTriangle className="h-4 w-4 text-warning" />;
  if (status === "taken" || status === "ready") return <CheckCircle className="h-4 w-4 text-success" />;
  if (status === "planned" || status === "draft") return <Clock className="h-4 w-4 text-primary" />;
  return <AlertTriangle className="h-4 w-4 text-warning" />;
}

function calculateProfileStrength(profile: Profile | null): number {
  if (!profile) return 0;
  
  let score = 0;
  let total = 0;

  // Academic (25 points)
  total += 25;
  if (profile.education_level) score += 5;
  if (profile.degree_major) score += 5;
  if (profile.graduation_year) score += 5;
  if (profile.gpa_percentage) score += 10;

  // Goals (25 points)
  total += 25;
  if (profile.intended_degree) score += 5;
  if (profile.field_of_study) score += 5;
  if (profile.target_intake_year) score += 5;
  if (profile.preferred_countries?.length) score += 10;

  // Budget (15 points)
  total += 15;
  if (profile.budget_min && profile.budget_max) score += 10;
  if (profile.funding_plan) score += 5;

  // Exams (35 points)
  total += 35;
  if (profile.ielts_toefl_status === "taken") score += 15;
  else if (profile.ielts_toefl_status === "planned") score += 5;
  
  if (profile.gre_gmat_status === "taken") score += 10;
  else if (profile.gre_gmat_status === "planned") score += 3;
  
  if (profile.sop_status === "ready") score += 10;
  else if (profile.sop_status === "draft") score += 5;

  return Math.round((score / total) * 100);
}

export function ProfileSidebar({ profile }: ProfileSidebarProps) {
  const strength = calculateProfileStrength(profile);
  
  const countryLabels = profile?.preferred_countries?.map(
    (code) => COUNTRIES.find((c) => c.value === code)?.label || code
  ) || [];

  const degreeLabel = INTENDED_DEGREES.find(
    (d) => d.value === profile?.intended_degree
  )?.label || profile?.intended_degree;

  return (
    <div className="w-80 flex-shrink-0 border-l border-border bg-muted/20 p-4 overflow-y-auto">
      <div className="space-y-4">
        {/* Profile Strength */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Profile Strength</h3>
            <span className="text-2xl font-bold text-primary">{strength}%</span>
          </div>
          <Progress value={strength} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {strength < 50 ? "Complete more fields to improve recommendations" :
             strength < 75 ? "Good progress! Add exam scores for better matching" :
             "Strong profile! Ready for university matching"}
          </p>
        </Card>

        {/* Academic */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Academic</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Education</span>
              <span className="font-medium capitalize">
                {profile?.education_level?.replace(/_/g, " ") || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GPA</span>
              <span className="font-medium">
                {profile?.gpa_percentage || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Graduation</span>
              <span className="font-medium">
                {profile?.graduation_year || "—"}
              </span>
            </div>
          </div>
        </Card>

        {/* Goals */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-secondary" />
            <h3 className="font-semibold text-sm">Study Goals</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Degree</span>
              <span className="font-medium">{degreeLabel || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Field</span>
              <span className="font-medium truncate max-w-[140px]">
                {profile?.field_of_study || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Intake</span>
              <span className="font-medium capitalize">
                {profile?.target_intake_term} {profile?.target_intake_year || "—"}
              </span>
            </div>
            {countryLabels.length > 0 && (
              <div className="pt-1">
                <span className="text-muted-foreground text-xs">Countries:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {countryLabels.slice(0, 3).map((country) => (
                    <span key={country} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                      {country}
                    </span>
                  ))}
                  {countryLabels.length > 3 && (
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                      +{countryLabels.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Budget */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="h-4 w-4 text-accent" />
            <h3 className="font-semibold text-sm">Budget</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Range</span>
              <span className="font-medium">
                {profile?.budget_min && profile?.budget_max
                  ? `$${profile.budget_min.toLocaleString()} - $${profile.budget_max.toLocaleString()}`
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Funding</span>
              <span className="font-medium capitalize">
                {profile?.funding_plan?.replace(/_/g, " ") || "—"}
              </span>
            </div>
          </div>
        </Card>

        {/* Readiness */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileCheck className="h-4 w-4 text-success" />
            <h3 className="font-semibold text-sm">Readiness</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">IELTS/TOEFL</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(profile?.ielts_toefl_status)}
                <span className="font-medium capitalize">
                  {profile?.ielts_toefl_status?.replace(/_/g, " ") || "—"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">GRE/GMAT</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(profile?.gre_gmat_status)}
                <span className="font-medium capitalize">
                  {profile?.gre_gmat_status?.replace(/_/g, " ") || "—"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">SOP</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(profile?.sop_status)}
                <span className="font-medium capitalize">
                  {profile?.sop_status?.replace(/_/g, " ") || "—"}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Edit Profile */}
        <Link to="/onboarding">
          <Button variant="outline" className="w-full gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
