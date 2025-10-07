import { SidebarTrigger, useSidebar } from "../ui/sidebar";
import { PanelLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type InlineSidebarTriggerProps = {
  className?: string;
};

const InlineSidebarTrigger = ({ className }: InlineSidebarTriggerProps) => {
  const { open: isSidebarOpen } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SidebarTrigger className={className}>
          <PanelLeft />
        </SidebarTrigger>
      </TooltipTrigger>
      <TooltipContent side="right">
        {isSidebarOpen ? "Ẩn sidebar" : "Hiển thị sidebar"}
      </TooltipContent>
    </Tooltip>
  );
};

export default InlineSidebarTrigger;
