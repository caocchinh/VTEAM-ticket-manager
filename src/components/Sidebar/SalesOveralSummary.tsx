"use client";

import { Loader2, ShoppingCart } from "lucide-react";
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

interface SalesOveralSummaryProps {
  totalOfflineOrders: number;
  totalOnlineOrders: number;
  totalRevenue: number;
  offlineRevenue: number;
  onlineRevenue: number;
  isSalesInfoError: boolean;
  isSalesInfoFetching: boolean;
}

const SalesOveralSummary = ({
  totalOfflineOrders,
  totalOnlineOrders,
  totalRevenue,
  offlineRevenue,
  onlineRevenue,
  isSalesInfoError,
  isSalesInfoFetching,
}: SalesOveralSummaryProps) => {
  const { open: isSidebarOpen, isMobile } = useSidebar();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={setIsDropdownOpen} open={isDropdownOpen}>
      <Collapsible defaultOpen={false} className="group/collapsible">
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip="Tổng doanh thu"
            onClick={() => {
              if (!isSidebarOpen) {
                setIsDropdownOpen(true);
              }
            }}
          >
            <ShoppingCart size={20} className="text-green-600" />
            <div className="whitespace-nowrap flex items-center gap-2">
              Tổng danh thu:{" "}
              {isSalesInfoError && !isSalesInfoFetching && (
                <span className="text-red-600"> Lỗi </span>
              )}
              <>
                {isSalesInfoFetching && (
                  <Loader2 className="animate-spin" size={16} />
                )}

                {!isSalesInfoFetching && !isSalesInfoError && (
                  <span className="font-medium text-green-600">
                    {formatVietnameseCurrency(totalRevenue)}
                  </span>
                )}
              </>
            </div>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            <DropdownMenuTrigger asChild>
              <div className="absolute top-full left-0 w-full h-1 opacity-0 pointer-events-none" />
            </DropdownMenuTrigger>
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          {(!isSalesInfoError || isSalesInfoFetching) && (
            <SidebarMenuSub>
              <SidebarMenuSubItem className="hover:bg-muted p-2 rounded-md text-sm whitespace-nowrap flex items-center gap-2">
                Tổng đơn hàng:{" "}
                <span className="font-medium">
                  {isSalesInfoFetching ? (
                    <Skeleton className="w-25 h-4" />
                  ) : (
                    totalOfflineOrders + totalOnlineOrders
                  )}
                </span>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem className="hover:bg-muted p-2 rounded-md text-sm whitespace-nowrap flex items-center gap-2">
                Đơn hàng offline:{" "}
                <span className="font-medium">
                  {isSalesInfoFetching ? (
                    <Skeleton className="w-25 h-4" />
                  ) : (
                    totalOfflineOrders
                  )}
                </span>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem className="hover:bg-muted p-2 rounded-md text-sm whitespace-nowrap flex items-center gap-2">
                Đơn hàng online:{" "}
                <span className="font-medium">
                  {isSalesInfoFetching ? (
                    <Skeleton className="w-25 h-4" />
                  ) : (
                    totalOnlineOrders
                  )}
                </span>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          )}
          {isSalesInfoError && !isSalesInfoFetching && (
            <SidebarMenuSub>
              <SidebarMenuSubItem className="hover:bg-muted p-2 rounded-md text-sm whitespace-nowrap flex items-center gap-2 text-red-600">
                Lỗi khi lấy dữ liệu
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          )}
        </CollapsibleContent>
      </Collapsible>
      <DropdownMenuContent
        className="min-w-(--radix-dropdown-menu-trigger-width) rounded-lg cursor-default"
        side={isMobile ? "bottom" : "right"}
        sideOffset={20}
        alignOffset={-35}
        align="start"
      >
        {(!isSalesInfoError || isSalesInfoFetching) && (
          <>
            <div className="hover:bg-muted p-2 rounded-md text-sm whitespace-nowrap flex items-center gap-2">
              Tổng danh thu:{" "}
              <span className="font-medium text-green-600">
                {isSalesInfoFetching ? (
                  <Skeleton className="w-20 h-4" />
                ) : (
                  formatVietnameseCurrency(totalRevenue)
                )}
              </span>
            </div>
            <Separator orientation="horizontal" />
            <div className="hover:bg-muted p-2 rounded-md text-sm whitespace-nowrap flex items-center gap-2">
              Doanh thu offline:{" "}
              <span className="font-medium text-blue-600">
                {isSalesInfoFetching ? (
                  <Skeleton className="w-20 h-4" />
                ) : (
                  formatVietnameseCurrency(offlineRevenue)
                )}
              </span>
            </div>
            <div className="hover:bg-muted p-2 rounded-md text-sm whitespace-nowrap flex items-center gap-2">
              Doanh thu online:{" "}
              <span className="font-medium text-orange-600">
                {isSalesInfoFetching ? (
                  <Skeleton className="w-20 h-4" />
                ) : (
                  formatVietnameseCurrency(onlineRevenue)
                )}
              </span>
            </div>
            <Separator orientation="horizontal" />
            <div className="hover:bg-muted p-2 rounded-md text-sm whitespace-nowrap flex items-center gap-2">
              Tổng đơn hàng:{" "}
              <span className="font-medium">
                {isSalesInfoFetching ? (
                  <Skeleton className="w-20 h-4" />
                ) : (
                  totalOfflineOrders + totalOnlineOrders
                )}
              </span>
            </div>
            <div className="hover:bg-muted p-2 rounded-md text-sm whitespace-nowrap flex items-center gap-2">
              Đơn hàng offline:{" "}
              <span className="font-medium">
                {isSalesInfoFetching ? (
                  <Skeleton className="w-20 h-4" />
                ) : (
                  totalOfflineOrders
                )}
              </span>
            </div>
            <div className="hover:bg-muted p-2 rounded-md text-sm whitespace-nowrap flex items-center gap-2">
              Đơn hàng online:{" "}
              <span className="font-medium">
                {isSalesInfoFetching ? (
                  <Skeleton className="w-20 h-4" />
                ) : (
                  totalOnlineOrders
                )}
              </span>
            </div>
          </>
        )}
        {isSalesInfoError && !isSalesInfoFetching && (
          <p className="hover:bg-muted p-2 rounded-md text-sm whitespace-nowrap flex items-center gap-2 text-red-600">
            Lỗi khi lấy dữ liệu
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SalesOveralSummary;
