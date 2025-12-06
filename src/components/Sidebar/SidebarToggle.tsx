import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarMenuButton, useSidebar, SidebarTrigger } from "../ui/sidebar";
import { PanelLeft } from "lucide-react";

const SidebarToggle = () => {
  const { open: isSidebarOpen, openMobile: isMobileSidebarOpen } = useSidebar();
  const isMobile = useIsMobile();

  const sideBarState = () => {
    const closedSidebar = "Hide sidebar";
    const openSidebar = "Show sidebar";
    if (isMobile && !isMobileSidebarOpen) {
      return closedSidebar;
    }
    if (isMobile && isMobileSidebarOpen) {
      return openSidebar;
    }

    return isSidebarOpen ? openSidebar : closedSidebar;
  };

  return (
    <SidebarMenuButton tooltip={sideBarState()} asChild>
      <SidebarTrigger className="p-0 flex items-center gap-2 justify-start">
        <PanelLeft />
        {sideBarState()}
      </SidebarTrigger>
    </SidebarMenuButton>
  );
};

export default SidebarToggle;
