import {
  FileText,
  GraduationCap,
  ClipboardList,
  DollarSign,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import { TaskCard } from "./TaskCard";
import type { ApplicationTask, TaskCategory } from "@/types/task";
import { TASK_CATEGORIES } from "@/types/task";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

const CATEGORY_ICONS: Record<TaskCategory, React.ElementType> = {
  document: FileText,
  exam: GraduationCap,
  application: ClipboardList,
  financial: DollarSign,
  other: MoreHorizontal,
};

const CATEGORY_ORDER: TaskCategory[] = ["document", "exam", "application", "financial", "other"];

interface TaskListProps {
  tasksByCategory: Record<TaskCategory, ApplicationTask[]>;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export function TaskList({ tasksByCategory, onToggle, onDelete }: TaskListProps) {
  const [openCategories, setOpenCategories] = useState<Set<TaskCategory>>(
    new Set(CATEGORY_ORDER)
  );

  const toggleCategory = (category: TaskCategory) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {CATEGORY_ORDER.map(category => {
        const tasks = tasksByCategory[category];
        if (!tasks || tasks.length === 0) return null;

        const categoryInfo = TASK_CATEGORIES[category];
        const CategoryIcon = CATEGORY_ICONS[category];
        const completedInCategory = tasks.filter(t => t.is_completed).length;
        const isOpen = openCategories.has(category);

        return (
          <Collapsible key={category} open={isOpen} onOpenChange={() => toggleCategory(category)}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", categoryInfo.color)}>
                    <CategoryIcon className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">{categoryInfo.label}</h3>
                    <p className="text-xs text-muted-foreground">
                      {completedInCategory} of {tasks.length} completed
                    </p>
                  </div>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform",
                  isOpen && "rotate-180"
                )} />
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="space-y-3 mt-3 pl-2">
                {tasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={() => onToggle(task.id)}
                    onDelete={() => onDelete(task.id)}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
