import { SidebarTrigger, useSidebar } from "../ui/sidebar";
import { PanelLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type InlineSidebarTriggerProps = {
  className?: string;
};

const InlineSidebarTrigger = ({ className }: InlineSidebarTriggerProps) => {
  const { open: isSidebarOpen, openMobile: isMobileSidebarOpen } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SidebarTrigger className={className}>
          <PanelLeft />
          <p className="block md:hidden">
            {isMobileSidebarOpen ? "Hide sidebar" : "Show sidebar"}
          </p>
        </SidebarTrigger>
      </TooltipTrigger>
      <TooltipContent side="right" className="hidden md:block">
        {isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
      </TooltipContent>
    </Tooltip>
  );
};

export default InlineSidebarTrigger;
