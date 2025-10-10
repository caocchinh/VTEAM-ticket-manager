"use client";

import { Loader2, UserStar } from "lucide-react";
import { formatVietnameseCurrency } from "@/lib/utils";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarMenuSub,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

interface StaffInfoProps {
  isSalesInfoPending: boolean;
  staffInfo: {
    revenue: number;
    orderCount: number;
  };
  isSalesInfoError: boolean;
  totalRevenue: number;
  totalRevenueOffline: number;
}

const StaffInfo = ({
  isSalesInfoPending,
  isSalesInfoError,
  staffInfo,
  totalRevenue,
  totalRevenueOffline,
}: StaffInfoProps) => {
  const { open: isSidebarOpen, isMobile } = useSidebar();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const calculatePercentage = (part: number, whole: number): number => {
    if (!Number.isFinite(part) || !Number.isFinite(whole) || whole <= 0) {
      return 0;
    }
    return Math.round((part / whole) * 100);
  };

  return (
    <DropdownMenu onOpenChange={setIsDropdownOpen} open={isDropdownOpen}>
      <Collapsible defaultOpen={false} className="group/collapsible">
        <CollapsibleTrigger asChild disabled={isSalesInfoPending}>
          <SidebarMenuButton
            tooltip="Doanh thu của bạn"
            onClick={() => {
              if (!isSidebarOpen) {
                setIsDropdownOpen(true);
              }
            }}
          >
            <UserStar size={20} className="text-yellow-500" />
            <div className="whitespace-nowrap flex items-center gap-2">
              Doanh thu của bạn:
              {isSalesInfoError ? (
                <span className="text-red-600"> Lỗi </span>
              ) : isSalesInfoPending ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <span className="font-medium text-green-600">
                  {formatVietnameseCurrency(staffInfo.revenue)}
                </span>
              )}
            </div>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            <DropdownMenuTrigger asChild>
              <div className="absolute top-full left-0 w-full h-1 opacity-0 pointer-events-none" />
            </DropdownMenuTrigger>
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub>
            <SidebarMenuSubItem className="hover:bg-muted p-2 rounded-md text-sm whitespace-nowrap flex items-center gap-2">
              Tổng đơn hàng:{" "}
              {isSalesInfoPending ? (
                <Skeleton className="w-25 h-4" />
              ) : (
                <span className="font-medium">{staffInfo.orderCount}</span>
              )}
            </SidebarMenuSubItem>
            <SidebarMenuSubItem className="hover:bg-muted p-2 rounded-md text-sm whitespace-nowrap flex items-center gap-2">
              % tổng doanh thu:
              {isSalesInfoPending ? (
                <Skeleton className="w-25 h-4" />
              ) : (
                <span className="font-medium">
                  {" "}
                  {calculatePercentage(staffInfo.revenue, totalRevenue)}%
                </span>
              )}
            </SidebarMenuSubItem>
            <SidebarMenuSubItem className="hover:bg-muted p-2 rounded-md text-sm whitespace-nowrap flex items-center gap-2">
              % tổng doanh thu offline:
              {isSalesInfoPending ? (
                <Skeleton className="w-25 h-4" />
              ) : (
                <span className="font-medium">
                  {" "}
                  {calculatePercentage(staffInfo.revenue, totalRevenueOffline)}%
                </span>
              )}
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
      <DropdownMenuContent
        className="min-w-(--radix-dropdown-menu-trigger-width) rounded-lg cursor-default"
        side={isMobile ? "bottom" : "right"}
        sideOffset={20}
        alignOffset={-35}
        align="start"
      >
        <p className="hover:bg-muted p-2 rounded-md text-sm whitespace-nowrap flex items-center gap-2">
          Doanh thu của bạn:{" "}
          <span className="font-medium text-green-600">
            {isSalesInfoPending ? (
              <Skeleton className="w-20 h-4" />
            ) : (
              formatVietnameseCurrency(staffInfo.revenue)
            )}
          </span>
        </p>
        <Separator orientation="horizontal" />
        <p className="hover:bg-muted p-2 rounded-md text-sm whitespace-nowrap flex items-center gap-2">
          Đơn hàng:{" "}
          <span className="font-medium">
            {isSalesInfoPending ? (
              <Skeleton className="w-20 h-4" />
            ) : (
              staffInfo.orderCount
            )}
          </span>
        </p>
        <p className="hover:bg-muted p-2 rounded-md text-sm whitespace-nowrap flex items-center gap-2">
          % tổng doanh thu:{" "}
          <span className="font-medium">
            {isSalesInfoPending ? (
              <Skeleton className="w-20 h-4" />
            ) : (
              calculatePercentage(staffInfo.revenue, totalRevenue)
            )}
          </span>
        </p>
        <p className="hover:bg-muted p-2 rounded-md text-sm whitespace-nowrap flex items-center gap-2">
          % tổng doanh thu offline:{" "}
          <span className="font-medium">
            {isSalesInfoPending ? (
              <Skeleton className="w-20 h-4" />
            ) : (
              calculatePercentage(staffInfo.revenue, totalRevenueOffline)
            )}
          </span>
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StaffInfo;
