import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  DollarSign,
  GraduationCap,
  Target,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  Lock,
  Unlock,
} from "lucide-react";
import type { University } from "@/types/university";
import { COUNTRY_NAMES, CATEGORY_INFO, LIKELIHOOD_INFO } from "@/types/university";
import { cn } from "@/lib/utils";
import { UnlockWarningModal } from "./UnlockWarningModal";

interface UniversityCardProps {
  university: University;
  isShortlisted?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
  onLock?: () => void;
  onUnlock?: () => void;
}

export function UniversityCard({
  university,
  isShortlisted = false,
  onAdd,
  onRemove,
  onLock,
  onUnlock,
}: UniversityCardProps) {
  const [showUnlockWarning, setShowUnlockWarning] = useState(false);
  const categoryInfo = CATEGORY_INFO[university.category];
  const likelihoodInfo = university.acceptance_likelihood
    ? LIKELIHOOD_INFO[university.acceptance_likelihood]
    : null;

  const tuition = university.tuition_per_year ?? 0;
  const living = university.living_cost_per_year ?? 0;
  const totalCost = tuition + living;

  return (
    <Card className={cn(
      "p-5 transition-all hover:shadow-lg",
      university.is_locked && "ring-2 ring-primary bg-primary/5"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={cn("text-xs", categoryInfo.color)}>
              {categoryInfo.label}
            </Badge>
            {university.is_locked && (
              <Badge variant="default" className="text-xs gap-1">
                <Lock className="h-3 w-3" />
                Locked
              </Badge>
            )}
          </div>
          <h3 className="font-display font-semibold text-lg leading-tight">
            {university.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>
              {university.city && `${university.city}, `}
              {COUNTRY_NAMES[university.country] || university.country}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0">
          {isShortlisted ? (
            <div className="flex gap-2">
              {university.is_locked ? (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowUnlockWarning(true)} 
                  className="gap-1"
                >
                  <Unlock className="h-4 w-4" />
                  Unlock
                </Button>
              ) : (
                <>
                  <Button size="sm" variant="default" onClick={onLock} className="gap-1">
                    <Lock className="h-4 w-4" />
                    Lock
                  </Button>
                  <Button size="sm" variant="ghost" onClick={onRemove}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          ) : (
            <Button size="sm" onClick={onAdd} className="gap-1">
              <Plus className="h-4 w-4" />
              Shortlist
            </Button>
          )}
        </div>
      </div>

      {/* Program Info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span className="font-medium">{university.program_name || university.field_of_study}</span>
          <span className="text-muted-foreground capitalize">• {university.degree_type}</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {tuition > 0 && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>Tuition: ${tuition.toLocaleString()}/yr</span>
            </div>
          )}
          {living > 0 && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>Living: ${living.toLocaleString()}/yr</span>
            </div>
          )}
          {tuition > 0 && living > 0 && (
            <div className="flex items-center gap-1 font-medium text-foreground">
              <span>Total: ${totalCost.toLocaleString()}/yr</span>
            </div>
          )}
          {tuition === 0 && living === 0 && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>Cost estimate on request</span>
            </div>
          )}
          {likelihoodInfo && (
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className={likelihoodInfo.color}>
                {likelihoodInfo.label} chance
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-3 pt-3 border-t border-border">
        {university.fit_explanation && (
          <div className="flex gap-2">
            <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">{university.fit_explanation}</p>
          </div>
        )}
        {university.risk_explanation && (
          <div className="flex gap-2">
            <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">{university.risk_explanation}</p>
          </div>
        )}
        {university.requirements_summary && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-1">Requirements</p>
            <p className="text-sm">{university.requirements_summary}</p>
          </div>
        )}
      </div>

      {/* Unlock Warning Modal */}
      <UnlockWarningModal
        open={showUnlockWarning}
        onOpenChange={setShowUnlockWarning}
        universityName={university.name}
        onConfirm={() => onUnlock?.()}
      />
    </Card>
  );
}
