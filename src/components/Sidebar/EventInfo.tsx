"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { cn, truncateText } from "@/lib/utils";
import { EventInfo } from "@/constants/types";
import { Button } from "../ui/button";

export default function SidebarEventInfo({
  offlineEventInfo,
  isOfflineEventInfoError,
  isOfflineEventInfoFetching,
  refetchOfflineEventInfo,
}: {
  isOfflineEventInfoError: boolean;
  isOfflineEventInfoFetching: boolean;
  offlineEventInfo: EventInfo | undefined;
  refetchOfflineEventInfo: () => void;
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div
            className={cn(
              " text-black  items-center gap-3",
              isOfflineEventInfoError &&
                !isOfflineEventInfoFetching &&
                "bg-red-500/60"
            )}
          >
            <div className="flex items-center justify-start gap-0">
              <Image
                src="/assets/logo.webp"
                width={50}
                height={50}
                className="-mt-2 -ml-[9px] "
                alt="VTEAM Logo"
              />
              {!isOfflineEventInfoError &&
                (offlineEventInfo?.eventName || isOfflineEventInfoFetching) && (
                  <div className="text-sm flex items-center justify-center whitespace-nowrap font-semibold">
                    {isOfflineEventInfoFetching ? (
                      <span className="text-gray-500">
                        Đang tải thông tin sự kiện...
                      </span>
                    ) : (
                      <p>
                        {truncateText(offlineEventInfo?.eventName || "", 30)}
                      </p>
                    )}
                  </div>
                )}
            </div>

            {isOfflineEventInfoError && !isOfflineEventInfoFetching && (
              <div className=" w-max h-full -ml-4 rounded-md flex items-center justify-center gap-2">
                <p className="text-white text-xs">Lỗi tải thông tin sự kiện</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="border-white border text-white mt-1 cursor-pointer text-xs h-6"
                  onClick={() => refetchOfflineEventInfo()}
                >
                  Thử lại
                </Button>
              </div>
            )}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
