"use client";

import { Loader2, TicketIcon } from "lucide-react";

import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { useState } from "react";
import { AllTicketInfo } from "@/constants/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";
import { Badge } from "../ui/badge";
import { formatVietnameseCurrency, parseVietnameseCurrency } from "@/lib/utils";

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
      <DropdownMenuTrigger asChild>
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
            {isTicketInfoError && !isTicketInfoFetching && (
              <span className="text-red-600"> Lỗi </span>
            )}
            <>
              {isTicketInfoFetching && (
                <Loader2 className="animate-spin" size={16} />
              )}
            </>
          </div>
        </SidebarMenuButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="min-w-(--radix-dropdown-menu-trigger-width) sm:min-w-[300px] w-max rounded-lg cursor-default"
        side={isMobile ? "bottom" : "right"}
        sideOffset={35}
        align="center"
      >
        <div className="flex items-center justify-between w-full">
          <p className="p-2 rounded-md text-sm font-medium">Thông tin vé</p>
          <X
            className="w-4 h-4 cursor-pointer text-red-600"
            onClick={() => setIsDropdownOpen(false)}
          />
        </div>
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
                <div
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
                  <div className="font-medium flex items-center gap-1">
                    <Badge className="bg-green-700">
                      {formatVietnameseCurrency(
                        parseVietnameseCurrency(ticket.price)
                      )}
                    </Badge>
                    {ticket.includeConcert ? (
                      <Badge
                        variant="outline"
                        className="bg-[#0084ff] text-white"
                      >
                        Có concert
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Không concert</Badge>
                    )}
                  </div>
                </div>
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
                <div
                  key={`dropdown-online-${index}`}
                  className="hover:bg-muted p-2 rounded-md text-sm whitespace-nowrap flex items-center justify-between gap-2"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {ticket.ticketName}
                    </span>
                  </span>
                  <div className="font-medium flex items-center gap-1">
                    <Badge className="bg-green-700">
                      {formatVietnameseCurrency(
                        parseVietnameseCurrency(ticket.price)
                      )}
                    </Badge>
                    {ticket.includeConcert ? (
                      <Badge
                        variant="outline"
                        className="bg-[#0084ff] text-white"
                      >
                        Có concert
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Không concert</Badge>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

        {/* Loading State in Dropdown */}
        {isTicketInfoFetching && (
          <>
            <div className="p-2 rounded-md text-sm">
              <Skeleton className="h-4 w-20" />
            </div>
            {[1, 2, 3].map((_, index) => (
              <div
                key={`dropdown-loading-${index}`}
                className="p-2 rounded-md text-sm whitespace-nowrap flex items-center justify-between gap-2"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </>
        )}

        {/* Error State in Dropdown */}
        {isTicketInfoError && !isTicketInfoFetching && (
          <p className="p-2 rounded-md text-sm text-red-600">
            Không thể tải thông tin vé. Vui lòng thử lại sau.
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
