import { SidebarMenuButton, useSidebar, SidebarTrigger } from "../ui/sidebar";
import { PanelLeft } from "lucide-react";

const SidebarToggle = () => {
  const { open: isSidebarOpen } = useSidebar();
  return (
    <SidebarMenuButton
      tooltip={isSidebarOpen ? "Ẩn sidebar" : "Hiển thị sidebar"}
      asChild
    >
      <SidebarTrigger className="p-0 flex items-center gap-2 justify-start">
        <PanelLeft />
        {isSidebarOpen ? "Ẩn sidebar" : "Hiển thị sidebar"}
      </SidebarTrigger>
    </SidebarMenuButton>
  );
};

export default SidebarToggle;
