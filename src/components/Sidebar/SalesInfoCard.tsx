"use client";

import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Loader2,
  RefreshCcw,
  ShoppingCart,
  TriangleAlert,
  Zap,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { cn, formatVietnameseCurrency } from "@/lib/utils";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import { SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { SPREADSHEET_LINKS } from "@/constants/constants";
import { SidebarMenuSub } from "@/components/ui/sidebar";
import { SidebarMenuSubItem } from "@/components/ui/sidebar";
import { SidebarMenuSubButton } from "@/components/ui/sidebar";
import { ExternalLinkIcon } from "lucide-react";
import { useState } from "react";

interface SalesInfoCardProps {
  isSalesInfoFetching: boolean;
  isSalesInfoError: boolean;
  isMoneyVisible: boolean;
  totalSalesAmount: number;
  currentStaffStats: {
    revenue: number;
    orderCount: number;
  };
  onToggleMoneyVisibility: () => void;
  onRefetchSales: () => void;
}

const SalesInfoCard = ({
  isSalesInfoFetching,
  isSalesInfoError,
  isMoneyVisible,
  totalSalesAmount,
  currentStaffStats,
  onToggleMoneyVisibility,
  onRefetchSales,
}: SalesInfoCardProps) => {
  const { open: isSidebarOpen, isMobile } = useSidebar();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={setIsDropdownOpen} open={isDropdownOpen}>
      <Collapsible asChild defaultOpen={false} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              tooltip={isSalesInfoError ? "Lỗi" : "Cập nhật dữ liệu sales"}
              onClick={() => {
                if (!isSidebarOpen) {
                  setIsDropdownOpen(true);
                }
              }}
            >
              <RefreshCw />
              <span
                className={cn(
                  "whitespace-nowrap",
                  isSalesInfoError && "text-red-500"
                )}
              >
                Cập nhật dữ liệu sales
              </span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              <DropdownMenuTrigger asChild>
                <div className="absolute top-full left-0 w-full h-1 opacity-0 pointer-events-none" />
              </DropdownMenuTrigger>
            </SidebarMenuButton>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <SidebarMenuSub>
              {SPREADSHEET_LINKS.map((link) => (
                <SidebarMenuSubItem key={link.id}>
                  <SidebarMenuSubButton asChild>
                    <a
                      target="_blank"
                      rel="noopener"
                      className="w-full flex whitespace-nowrap items-center justify-start gap-4 hover:bg-muted p-2 rounded-md"
                      href={link.href}
                    >
                      {link.number}. <span>{link.label}</span>
                      <ExternalLinkIcon className="w-4 h-4 -ml-2" />
                    </a>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        sideOffset={20}
        alignOffset={-35}
        align="start"
      >
        {SPREADSHEET_LINKS.map((link) => (
          <div
            key={link.id}
            className="!p-0 focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <a
              target="_blank"
              rel="noopener"
              className="w-full flex items-center justify-start gap-4 hover:bg-muted p-2 rounded-md"
              href={link.href}
            >
              {link.number}. <span>{link.label}</span>
              <ExternalLinkIcon className="w-4 h-4 -ml-2" />
            </a>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SalesInfoCard;
