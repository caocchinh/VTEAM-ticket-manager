"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Palette, RotateCcw } from "lucide-react";
import ColorPicker from "./ColorPicker";
import { TicketInfo } from "@/constants/types";

interface TicketColorManagerProps {
  ticketInfo: TicketInfo[];
  ticketColors: Record<string, string>;
  onColorChange: (ticketType: string, color: string) => void;
  onResetColors: () => void;
}

const DEFAULT_COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange
  "#ec4899", // pink
  "#6b7280", // gray
];

const TicketColorManager = ({
  ticketInfo,
  ticketColors,
  onColorChange,
  onResetColors,
}: TicketColorManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getDefaultColor = (ticketType: string, index: number) => {
    // Use the same logic as the main component for consistency
    const uniqueTicketTypes = Array.from(
      new Set(ticketInfo.map((ticket) => ticket.ticketName))
    ).sort();

    const ticketIndex = uniqueTicketTypes.indexOf(ticketType);
    return DEFAULT_COLORS[
      ticketIndex >= 0
        ? ticketIndex % DEFAULT_COLORS.length
        : index % DEFAULT_COLORS.length
    ];
  };

  const uniqueTicketTypes = Array.from(
    new Set(ticketInfo.map((ticket) => ticket.ticketName))
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette size={16} />
          Màu vé
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Quản lý màu sắc hạng vé</DialogTitle>
          <DialogDescription>
            Chọn màu sắc cho từng loại vé để dễ phân biệt trong danh sách order
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {uniqueTicketTypes.map((ticketType, index) => (
              <div key={ticketType}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{ticketType}</p>
                    <p className="text-xs text-muted-foreground">
                      {
                        ticketInfo.find((t) => t.ticketName === ticketType)
                          ?.price
                      }
                    </p>
                  </div>
                  <ColorPicker
                    color={
                      ticketColors[ticketType] ||
                      getDefaultColor(ticketType, index)
                    }
                    onChange={(color) => onColorChange(ticketType, color)}
                    label={`Màu cho ${ticketType}`}
                  />
                </div>
                {index < uniqueTicketTypes.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onResetColors}
            className="gap-2 w-full sm:w-auto"
          >
            <RotateCcw size={16} />
            Đặt lại màu mặc định
          </Button>
          <Button onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
            Xong
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TicketColorManager;
