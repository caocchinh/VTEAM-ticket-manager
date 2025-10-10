"use client";

import { ChevronRight, Loader2, TicketIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useState } from "react";
import { AllTicketInfo } from "@/constants/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface TicketsInfoProps {
  ticketInfo: AllTicketInfo | undefined;
  isTicketInfoFetching: boolean;
  getTicketColor: (ticketType: string) => string;
  isTicketInfoError: boolean;
}

export function TicketsInfo({
  ticketInfo,
  isTicketInfoFetching,
  getTicketColor,
  isTicketInfoError,
}: TicketsInfoProps) {
  const { open: isSidebarOpen, isMobile } = useSidebar();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={setIsDropdownOpen} open={isDropdownOpen}>
      <Collapsible defaultOpen={false} className="group/tickets">
        <CollapsibleTrigger asChild disabled={isTicketInfoFetching}>
          <SidebarMenuButton
            tooltip="Thông tin vé"
            onClick={() => {
              if (!isSidebarOpen) {
                setIsDropdownOpen(true);
              }
            }}
          >
            <TicketIcon className="w-[21px] h-[21px]" />
            <div className="whitespace-nowrap flex items-center gap-2">
              Thông tin vé{" "}
              {isTicketInfoError ? (
                <span className="text-red-600"> Lỗi </span>
              ) : (
                <>
                  {isTicketInfoFetching && (
                    <Loader2 className="animate-spin" size={16} />
                  )}
                </>
              )}
            </div>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/tickets:rotate-90" />
            <DropdownMenuTrigger asChild>
              <div className="absolute top-full left-0 w-full h-1 opacity-0 pointer-events-none" />
            </DropdownMenuTrigger>
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub>
            {/* Offline Tickets Section */}
            {!isTicketInfoFetching &&
              !isTicketInfoError &&
              ticketInfo?.offline &&
              ticketInfo.offline.length > 0 && (
                <>
                  <SidebarMenuSubItem>
                    <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                      Vé Offline
                    </div>
                  </SidebarMenuSubItem>
                  {ticketInfo.offline.map((ticket, index) => (
                    <SidebarMenuSubItem key={`offline-${index}`}>
                      <div className="w-full flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: getTicketColor(
                                ticket.ticketName
                              ),
                            }}
                          />
                          <span className="text-sm font-medium">
                            {ticket.ticketName}
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {ticket.price}
                        </span>
                      </div>
                    </SidebarMenuSubItem>
                  ))}
                </>
              )}

            {/* Online Tickets Section */}
            {!isTicketInfoFetching &&
              !isTicketInfoError &&
              ticketInfo?.online &&
              ticketInfo.online.length > 0 && (
                <>
                  <SidebarMenuSubItem>
                    <div className="px-2 py-1 text-sm font-medium text-muted-foreground mt-2">
                      Vé Online
                    </div>
                  </SidebarMenuSubItem>
                  {ticketInfo.online.map((ticket, index) => (
                    <SidebarMenuSubItem key={`online-${index}`}>
                      <div className="w-full flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {ticket.ticketName}
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {ticket.price}
                        </span>
                      </div>
                    </SidebarMenuSubItem>
                  ))}
                </>
              )}

            {/* Loading State */}
            {isTicketInfoFetching && (
              <>
                <SidebarMenuSubItem>
                  <div className="px-2 py-1">
                    <Skeleton className="h-4 w-20" />
                  </div>
                </SidebarMenuSubItem>
                {[1, 2, 3].map((_, index) => (
                  <SidebarMenuSubItem key={`loading-${index}`}>
                    <div className="w-full flex items-center justify-between gap-2 p-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </SidebarMenuSubItem>
                ))}
              </>
            )}

            {/* Error State */}
            {isTicketInfoError && (
              <SidebarMenuSubItem>
                <div className="px-2 py-1 text-sm text-red-600">
                  Không thể tải thông tin vé. Vui lòng thử lại sau.
                </div>
              </SidebarMenuSubItem>
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>

      <DropdownMenuContent
        className="min-w-(--radix-dropdown-menu-trigger-width) w-max rounded-lg cursor-default"
        side={isMobile ? "bottom" : "right"}
        sideOffset={20}
        alignOffset={-35}
        align="start"
      >
        <p className="p-2 rounded-md text-sm font-medium">Thông tin vé</p>
        <Separator orientation="horizontal" />

        {/* Offline Tickets Section in Dropdown */}
        {!isTicketInfoFetching &&
          !isTicketInfoError &&
          ticketInfo?.offline &&
          ticketInfo.offline.length > 0 && (
            <>
              <p className="p-2 rounded-md text-sm font-medium text-muted-foreground">
                Vé Offline
              </p>
              {ticketInfo.offline.map((ticket, index) => (
                <p
                  key={`dropdown-offline-${index}`}
                  className="hover:bg-muted p-2 rounded-md text-sm whitespace-nowrap flex items-center justify-between gap-2"
                >
                  <span className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: getTicketColor(ticket.ticketName),
                      }}
                    />
                    <span className="text-sm font-medium">
                      {ticket.ticketName}
                    </span>
                  </span>
                  <span className="font-medium">{ticket.price}</span>
                </p>
              ))}
              <Separator orientation="horizontal" />
            </>
          )}

        {/* Online Tickets Section in Dropdown */}
        {!isTicketInfoFetching &&
          !isTicketInfoError &&
          ticketInfo?.online &&
          ticketInfo.online.length > 0 && (
            <>
              <p className="p-2 rounded-md text-sm font-medium text-muted-foreground">
                Vé Online
              </p>
              {ticketInfo.online.map((ticket, index) => (
                <p
                  key={`dropdown-online-${index}`}
                  className="hover:bg-muted p-2 rounded-md text-sm whitespace-nowrap flex items-center justify-between gap-2"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {ticket.ticketName}
                    </span>
                  </span>
                  <span className="font-medium">{ticket.price}</span>
                </p>
              ))}
            </>
          )}

        {/* Loading State in Dropdown */}
        {isTicketInfoFetching && (
          <>
            <p className="p-2 rounded-md text-sm">
              <Skeleton className="h-4 w-20" />
            </p>
            {[1, 2, 3].map((_, index) => (
              <p
                key={`dropdown-loading-${index}`}
                className="p-2 rounded-md text-sm whitespace-nowrap flex items-center justify-between gap-2"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </p>
            ))}
          </>
        )}

        {/* Error State in Dropdown */}
        {isTicketInfoError && (
          <p className="p-2 rounded-md text-sm text-red-600">
            Không thể tải thông tin vé. Vui lòng thử lại sau.
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
