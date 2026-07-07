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
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function ReportDeleteConfirmDialog({
  open,
  reportName,
  count = 1,
  entityLabel = "report",
  onOpenChange,
  onConfirm,
}: ReportDeleteConfirmDialogProps) {
  const plural = count !== 1;
  const entityPlural = `${entityLabel}s`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent style={{ fontFamily: reportFont }}>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {plural ? `${count} ${entityPlural}` : entityLabel}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {plural
              ? `This will permanently delete ${count} ${entityPlural}. This action cannot be undone.`
              : `This will permanently delete "${reportName}". This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-[#F04438] hover:bg-[#D92D20] focus:ring-[#F04438]"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
