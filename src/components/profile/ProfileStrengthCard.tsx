import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { calculateProfileStrength, calculateProfileStrengthDetailed } from "@/hooks/useProfile";
import { CheckCircle, AlertCircle, GraduationCap, FileCheck, Wallet } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface ProfileStrengthCardProps {
  profile: Profile | null;
}

const ACADEMICS_LABEL: Record<string, string> = { strong: "Strong", moderate: "Moderate", weak: "Weak" };
const EXAMS_LABEL: Record<string, string> = { ready: "Ready", in_progress: "In Progress", missing: "Missing" };
const BUDGET_LABEL: Record<string, string> = { good: "Good", tight: "Tight", risky: "Risky" };

function strengthColor(level: string): string {
  if (level === "strong" || level === "ready" || level === "good") return "bg-success/20 text-success border-success/30";
  if (level === "moderate" || level === "in_progress" || level === "tight") return "bg-warning/20 text-warning border-warning/30";
  return "bg-destructive/10 text-destructive border-destructive/30";
}

export function ProfileStrengthCard({ profile }: ProfileStrengthCardProps) {
  const strength = calculateProfileStrength(profile);
  const detailed = calculateProfileStrengthDetailed(profile);

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {detailed.overallReadinessScore >= 70 ? (
            <CheckCircle className="h-5 w-5 text-success" />
          ) : (
            <AlertCircle className="h-5 w-5 text-warning" />
          )}
          Profile Strength
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Readiness</span>
            <span className="font-bold text-lg">{detailed.overallReadinessScore}</span>
          </div>
          <Progress value={Math.min(100, detailed.overallReadinessScore)} className="h-2" />
        </div>

        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" /> Academics
            </span>
            <Badge variant="outline" className={strengthColor(detailed.academics)}>
              {ACADEMICS_LABEL[detailed.academics] ?? detailed.academics}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <FileCheck className="h-4 w-4" /> Exams
            </span>
            <Badge variant="outline" className={strengthColor(detailed.exams)}>
              {EXAMS_LABEL[detailed.exams] ?? detailed.exams}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Wallet className="h-4 w-4" /> Budget Fit
            </span>
            <Badge variant="outline" className={strengthColor(detailed.budgetFit)}>
              {BUDGET_LABEL[detailed.budgetFit] ?? detailed.budgetFit}
            </Badge>
          </div>
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
          {strength.completedFields} of {strength.totalFields} fields completed
        </div>

        {strength.missingFields.length > 0 && strength.missingFields.length <= 5 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs font-medium mb-1">Missing:</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {strength.missingFields.slice(0, 3).map((field) => (
                <li key={field} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-warning" />
                  {field}
                </li>
              ))}
              {strength.missingFields.length > 3 && (
                <li>+{strength.missingFields.length - 3} more</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
