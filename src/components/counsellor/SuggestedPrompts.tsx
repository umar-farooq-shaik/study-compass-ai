import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  GraduationCap, 
  FileText, 
  Target, 
  DollarSign,
  BookOpen 
} from "lucide-react";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

const PROMPTS = [
  {
    icon: Sparkles,
    label: "Analyze my profile",
    prompt: "Analyze my complete profile. What are my strengths and what areas need improvement for a successful study abroad application?",
  },
  {
    icon: GraduationCap,
    label: "Recommend universities",
    prompt: "Based on my profile, recommend 5-7 universities I should consider. Include Dream, Target, and Safe options with acceptance likelihood.",
  },
  {
    icon: Target,
    label: "Improve my chances",
    prompt: "What specific actions can I take in the next 3 months to significantly improve my admission chances?",
  },
  {
    icon: BookOpen,
    label: "Exam strategy",
    prompt: "Create a personalized exam preparation strategy for me based on my current status and target universities.",
  },
  {
    icon: FileText,
    label: "SOP guidance",
    prompt: "Help me outline my Statement of Purpose. What unique aspects of my background should I highlight?",
  },
  {
    icon: DollarSign,
    label: "Scholarship options",
    prompt: "What scholarship and funding opportunities am I eligible for based on my profile and preferred countries?",
  },
];

export function SuggestedPrompts({ onSelect, disabled }: SuggestedPromptsProps) {
  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {PROMPTS.map((prompt) => (
        <Button
          key={prompt.label}
          variant="outline"
          className="h-auto min-h-[88px] p-4 flex flex-col items-start gap-2 text-left hover:border-primary/50 hover:bg-primary/5 transition-all justify-start overflow-hidden hover:text-foreground"
          onClick={() => onSelect(prompt.prompt)}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 flex-shrink-0 w-full">
            <prompt.icon className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="font-medium text-sm truncate text-foreground">{prompt.label}</span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed w-full overflow-hidden text-ellipsis">
            {prompt.prompt}
          </p>
        </Button>
      ))}
    </div>
  );
}
