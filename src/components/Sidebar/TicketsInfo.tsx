"use client";

import { Loader2, TicketIcon } from "lucide-react";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { useState, useMemo } from "react";
import { AllTicketInfo, TicketInfo } from "@/constants/types";
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

  const mutualTicketTypes = useMemo(() => {
    if (ticketInfo && ticketInfo.offline && ticketInfo.online) {
      const mutual: TicketInfo[] = [];

      ticketInfo.offline.forEach((offlineTicket) => {
        const matchingOnlineTicket = ticketInfo.online?.find(
          (onlineTicket) =>
            onlineTicket.ticketName === offlineTicket.ticketName &&
            onlineTicket.price === offlineTicket.price
        );

        if (matchingOnlineTicket) {
          mutual.push({
            ...offlineTicket,
            maxQuantity: Math.min(
              offlineTicket.maxQuantity,
              matchingOnlineTicket.maxQuantity
            ),
          });
        }
      });

      return mutual;
    }
    return [];
  }, [ticketInfo]);

  const distinctOfflineTickets = useMemo(() => {
    if (ticketInfo && ticketInfo.offline) {
      return ticketInfo.offline.filter(
        (offlineTicket) =>
          !mutualTicketTypes.some(
            (mutualTicket) =>
              mutualTicket.ticketName === offlineTicket.ticketName &&
              mutualTicket.price === offlineTicket.price
          )
      );
    }
    return [];
  }, [ticketInfo, mutualTicketTypes]);

  const distinctOnlineTickets = useMemo(() => {
    if (ticketInfo && ticketInfo.online) {
      return ticketInfo.online.filter(
        (onlineTicket) =>
          !mutualTicketTypes.some(
            (mutualTicket) =>
              mutualTicket.ticketName === onlineTicket.ticketName &&
              mutualTicket.price === onlineTicket.price
          )
      );
    }
    return [];
  }, [ticketInfo, mutualTicketTypes]);

  return (
    <DropdownMenu onOpenChange={setIsDropdownOpen} open={isDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          tooltip="Ticket info"
          onClick={() => {
            if (!isSidebarOpen) {
              setIsDropdownOpen(true);
            }
          }}
        >
          <TicketIcon className="w-[21px] h-[21px]" />
          <div className="whitespace-nowrap flex items-center gap-2">
            Ticket info{" "}
            {isTicketInfoError && !isTicketInfoFetching && (
              <span className="text-red-600"> Error </span>
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
          <p className="p-2 rounded-md text-sm font-medium">Ticket info</p>
          <X
            className="w-4 h-4 cursor-pointer text-red-600"
            onClick={() => setIsDropdownOpen(false)}
          />
        </div>
        <Separator orientation="horizontal" />

        {/* Mutual Tickets Section */}
        {!isTicketInfoFetching &&
          !isTicketInfoError &&
          mutualTicketTypes.length > 0 && (
            <>
              <p className="p-2 rounded-md text-sm font-medium text-muted-foreground">
                Mutual tickets (Offline & Online)
              </p>
              {mutualTicketTypes.map((ticket, index) => (
                <div
                  key={`dropdown-mutual-${index}`}
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
                    <Badge className="text-xs bg-yellow-500">
                      Max: {ticket.maxQuantity}
                    </Badge>
                    {ticket.includeConcert ? (
                      <Badge
                        variant="outline"
                        className="bg-[#0084ff] text-white"
                      >
                        Include concert
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Not include concert</Badge>
                    )}
                  </div>
                </div>
              ))}
              <Separator orientation="horizontal" />
            </>
          )}

        {/* Distinct Offline Tickets Section */}
        {!isTicketInfoFetching &&
          !isTicketInfoError &&
          distinctOfflineTickets.length > 0 && (
            <>
              <p className="p-2 rounded-md text-sm font-medium text-muted-foreground">
                Distinct Offline Tickets
              </p>
              {distinctOfflineTickets.map((ticket, index) => (
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
                    <Badge className="text-xs bg-yellow-500">
                      Max: {ticket.maxQuantity}
                    </Badge>
                    {ticket.includeConcert ? (
                      <Badge
                        variant="outline"
                        className="bg-[#0084ff] text-white"
                      >
                        Include concert
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Not include concert</Badge>
                    )}
                  </div>
                </div>
              ))}
              <Separator orientation="horizontal" />
            </>
          )}

        {/* Distinct Online Tickets Section */}
        {!isTicketInfoFetching &&
          !isTicketInfoError &&
          distinctOnlineTickets.length > 0 && (
            <>
              <p className="p-2 rounded-md text-sm font-medium text-muted-foreground">
                Distinct Online Tickets
              </p>
              {distinctOnlineTickets.map((ticket, index) => (
                <div
                  key={`dropdown-online-${index}`}
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
                    <Badge className="text-xs bg-yellow-500">
                      Max: {ticket.maxQuantity}
                    </Badge>
                    {ticket.includeConcert ? (
                      <Badge
                        variant="outline"
                        className="bg-[#0084ff] text-white"
                      >
                        Include concert
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Not include concert</Badge>
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
            Can&apos;t load ticket info. Please try again later.
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
