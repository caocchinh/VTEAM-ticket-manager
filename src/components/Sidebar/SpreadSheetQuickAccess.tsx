"use client";

import { ChevronRight, ExternalLinkIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { SPREADSHEET_LINKS } from "@/constants/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export function SpreadSheetQuickAccess() {
  const { open: isSidebarOpen, isMobile } = useSidebar();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={setIsDropdownOpen} open={isDropdownOpen}>
      <Collapsible defaultOpen={false} className="group/collapsible">
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip="Spreadsheet quick access"
            onClick={() => {
              if (!isSidebarOpen) {
                setIsDropdownOpen(true);
              }
            }}
          >
            <Image
              src="/assets/sheet_logo.webp"
              className="w-[21px] h-[21px] object-contain"
              alt="Google Sheet logo"
              width={21}
              height={21}
            />
            <span className="whitespace-nowrap">Spreadsheet quick access</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            <DropdownMenuTrigger asChild>
              <div className="absolute top-full left-0 w-full h-1 opacity-0 pointer-events-none" />
            </DropdownMenuTrigger>
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub>
            {SPREADSHEET_LINKS.map((link, index) => (
              <SidebarMenuSubItem key={link.href + index}>
                <SidebarMenuSubButton asChild>
                  <a
                    target="_blank"
                    rel="noopener"
                    className="w-full flex whitespace-nowrap items-center justify-start gap-4 hover:bg-muted p-2 rounded-md"
                    href={link.href}
                  >
                    {index + 1}. <span>{link.label}</span>
                    <ExternalLinkIcon className="w-4 h-4 -ml-2" />
                  </a>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        sideOffset={20}
        alignOffset={-35}
        align="start"
      >
        {SPREADSHEET_LINKS.map((link, index) => (
          <div
            key={link.href + index}
            className="!p-0 focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <a
              target="_blank"
              rel="noopener"
              className="w-full flex items-center justify-start gap-4 hover:bg-muted p-2 rounded-md"
              href={link.href}
            >
              {index + 1}. <span>{link.label}</span>
              <ExternalLinkIcon className="w-4 h-4 -ml-2" />
            </a>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
