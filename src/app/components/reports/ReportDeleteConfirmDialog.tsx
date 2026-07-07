import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { reportFont } from "./reportUiStyles";

type ReportDeleteConfirmDialogProps = {
  open: boolean;
  reportName: string;
  count?: number;
  entityLabel?: string;
  isDeleting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
};

export function ReportDeleteConfirmDialog({
  open,
  reportName,
  count = 1,
  entityLabel = "report",
  isDeleting = false,
  onOpenChange,
  onConfirm,
}: ReportDeleteConfirmDialogProps) {
  const plural = count !== 1;
  const entityPlural = `${entityLabel}s`;

  const handleOpenChange = (nextOpen: boolean) => {
    if (isDeleting) return;
    onOpenChange(nextOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent style={{ fontFamily: reportFont }}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Report</AlertDialogTitle>
          <AlertDialogDescription>
            {plural
              ? `This will permanently delete ${count} ${entityPlural}. This action cannot be undone.`
              : `Are you sure you want to delete "${reportName}"? This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={(event) => {
              event.preventDefault();
              void onConfirm();
            }}
            className="bg-[#F04438] hover:bg-[#D92D20] focus:ring-[#F04438] disabled:opacity-70"
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className="animate-spin" aria-hidden />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
