import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  GraduationCap,
  ClipboardList,
  DollarSign,
  MoreHorizontal,
  Trash2,
  Calendar,
  Sparkles,
} from "lucide-react";
import type { ApplicationTask, TaskCategory } from "@/types/task";
import { TASK_CATEGORIES, TASK_PRIORITIES } from "@/types/task";
import { cn } from "@/lib/utils";
import { format, isPast, isToday, isTomorrow } from "date-fns";

const CATEGORY_ICONS: Record<TaskCategory, React.ElementType> = {
  document: FileText,
  exam: GraduationCap,
  application: ClipboardList,
  financial: DollarSign,
  other: MoreHorizontal,
};

interface TaskCardProps {
  task: ApplicationTask;
  onToggle: () => void;
  onDelete: () => void;
}

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const categoryInfo = TASK_CATEGORIES[task.category];
  const priorityInfo = TASK_PRIORITIES[task.priority];
  const CategoryIcon = CATEGORY_ICONS[task.category];

  const getDueDateLabel = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isPast(date)) return `Overdue (${format(date, "MMM d")})`;
    return format(date, "MMM d, yyyy");
  };

  const isDueSoon = task.due_date && !task.is_completed && (isToday(new Date(task.due_date)) || isPast(new Date(task.due_date)));

  return (
    <Card className={cn(
      "p-4 transition-all hover:shadow-md",
      task.is_completed && "opacity-60 bg-muted/30"
    )}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.is_completed}
          onCheckedChange={onToggle}
          className="mt-1"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", categoryInfo.color)}>
              <CategoryIcon className="h-3.5 w-3.5" />
            </div>
            <h4 className={cn(
              "font-medium text-sm",
              task.is_completed && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h4>
            {task.is_ai_generated && (
              <Sparkles className="h-3 w-3 text-primary" />
            )}
          </div>
          
          {task.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn("text-xs", priorityInfo.color)}>
              {priorityInfo.label}
            </Badge>
            
            {task.due_date && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs gap-1",
                  isDueSoon && "border-red-300 text-red-600 bg-red-50 dark:bg-red-900/30"
                )}
              >
                <Calendar className="h-3 w-3" />
                {getDueDateLabel(task.due_date)}
              </Badge>
            )}
          </div>
        </div>
        
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
