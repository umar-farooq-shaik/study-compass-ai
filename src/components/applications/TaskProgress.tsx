import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";
import type { ApplicationTask } from "@/types/task";
import { isPast, isToday, differenceInDays } from "date-fns";

interface TaskProgressProps {
  tasks: ApplicationTask[];
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
}

export function TaskProgress({ tasks, completedCount, totalCount, progressPercentage }: TaskProgressProps) {
  const overdueTasks = tasks.filter(t => !t.is_completed && t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date)));
  const upcomingTasks = tasks.filter(t => !t.is_completed && t.due_date && !isPast(new Date(t.due_date)));
  const urgentTasks = upcomingTasks.filter(t => t.due_date && differenceInDays(new Date(t.due_date), new Date()) <= 7);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">Application Progress</h3>
          <p className="text-sm text-muted-foreground">
            {completedCount} of {totalCount} tasks completed
          </p>
        </div>
        <span className={`text-3xl font-bold ${
          progressPercentage >= 80 ? "text-green-600" :
          progressPercentage >= 50 ? "text-amber-600" : "text-primary"
        }`}>
          {progressPercentage}%
        </span>
      </div>
      
      <Progress value={progressPercentage} className="h-3 mb-6" />
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-600" />
          <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
          <Clock className="h-5 w-5 mx-auto mb-1 text-amber-600" />
          <p className="text-2xl font-bold text-amber-600">{urgentTasks.length}</p>
          <p className="text-xs text-muted-foreground">Due Soon</p>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-red-600" />
          <p className="text-2xl font-bold text-red-600">{overdueTasks.length}</p>
          <p className="text-xs text-muted-foreground">Overdue</p>
        </div>
      </div>
    </Card>
  );
}
