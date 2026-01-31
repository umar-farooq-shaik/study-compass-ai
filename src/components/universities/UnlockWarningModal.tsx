import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface UnlockWarningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  universityName: string;
  onConfirm: () => void;
}

export function UnlockWarningModal({
  open,
  onOpenChange,
  universityName,
  onConfirm,
}: UnlockWarningModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            </div>
            <AlertDialogTitle className="text-lg">
              Unlock University?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 text-left">
            <p>
              You're about to unlock <strong className="text-foreground">{universityName}</strong>.
            </p>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                What happens when you unlock:
              </p>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
                <li>Application tasks for this university will be paused</li>
                <li>Your focused application strategy may change</li>
                <li>You can re-lock the university anytime</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Consider keeping universities locked once you've committed to applying.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel>Keep Locked</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Yes, Unlock
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
