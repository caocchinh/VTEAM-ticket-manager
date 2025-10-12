import { SquareUserRound } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import { SidebarMenuButton } from "../ui/sidebar";
import { useState } from "react";
import { OfflineSalesInfo, TicketInfo } from "@/constants/types";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import SalesSummary from "./SalesSummary";

interface StaffSumaryProps {
  offlineSalesInfo: OfflineSalesInfo[] | undefined;
  isSalesInfoError: boolean;
  isSalesInfoFetching: boolean;
  onRefetchSales: () => void;
  isRefetchingSales: boolean;
  staffName: string;
  getTicketColor: (ticketType: string) => string;
  ticketInfo: TicketInfo[] | undefined;
}

const StaffSumary = ({
  offlineSalesInfo,
  isSalesInfoError,
  isSalesInfoFetching,
  getTicketColor,
  onRefetchSales,
  isRefetchingSales,
  staffName,
  ticketInfo,
}: StaffSumaryProps) => {
  const [isStaffSumaryOpen, setIsStaffSumaryOpen] = useState(false);

  // Render function for individual order details section

  return (
    <Dialog open={isStaffSumaryOpen} onOpenChange={setIsStaffSumaryOpen}>
      <DialogTrigger asChild>
        <SidebarMenuButton
          tooltip="Lịch sử bán vé của bạn"
          className="bg-fuchsia-700 active:bg-fuchsia-700 text-white hover:bg-fuchsia-700 hover:text-white cursor-pointer active:text-white"
          disabled={!offlineSalesInfo || isSalesInfoError}
        >
          <SquareUserRound />
          <span className="whitespace-nowrap">Lịch sử bán vé của bạn</span>
        </SidebarMenuButton>
      </DialogTrigger>

      <DialogContent className="max-h-[95vh] !py-4 !max-w-[100vw] w-[90vw]">
        <DialogTitle className="sr-only">Lịch sử bán vé của bạn</DialogTitle>
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-center font-semibold text-xl uppercase">
            Lịch sử bán vé của bạn
          </h3>
          <Separator orientation="vertical" />
          <Button
            onClick={() => onRefetchSales()}
            variant="ghost"
            className="border border-black cursor-pointer"
            disabled={isRefetchingSales || isSalesInfoFetching}
          >
            Cập nhật dữ liệu
            {(isRefetchingSales || isSalesInfoFetching) && (
              <Loader2 className="animate-spin " />
            )}
          </Button>
        </div>

        <ScrollArea className="h-[calc(95vh-150px)] pr-4">
          {offlineSalesInfo && ticketInfo ? (
            <SalesSummary
              salesInfo={offlineSalesInfo}
              ticketInfo={ticketInfo}
              staffName={staffName}
              showTotalRevenue={false}
              getTicketColor={getTicketColor}
              hideFilters={true}
            />
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Không có dữ liệu bán hàng</p>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            className="w-full cursor-pointer"
            onClick={() => setIsStaffSumaryOpen(false)}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StaffSumary;
