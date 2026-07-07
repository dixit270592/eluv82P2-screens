import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function ReportTooltipButton({
  label,
  children,
  side = "top",
}: {
  label: string;
  children: React.ReactElement;
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} sideOffset={6} className="bg-[#101828] text-white text-[11px]">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
