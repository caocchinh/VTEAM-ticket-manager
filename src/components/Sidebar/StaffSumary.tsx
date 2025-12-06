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
  totalOfflineRevenue: number;
}

const StaffSumary = ({
  offlineSalesInfo,
  isSalesInfoError,
  isSalesInfoFetching,
  totalOfflineRevenue,
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
          tooltip="Your sales history"
          className="bg-fuchsia-700 active:bg-fuchsia-700 text-white hover:bg-fuchsia-700 hover:text-white cursor-pointer active:text-white"
          disabled={!offlineSalesInfo || isSalesInfoError}
        >
          <SquareUserRound />
          <span className="whitespace-nowrap">Your sales history</span>
        </SidebarMenuButton>
      </DialogTrigger>

      <DialogContent className="h-[97dvh] gap-2 !py-2 !max-w-[100vw] w-[95vw]">
        <DialogTitle className="sr-only">Your sales history</DialogTitle>
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-center font-semibold text-xl uppercase">
            Your sales history
          </h3>
          <Separator orientation="vertical" />
          <Button
            onClick={() => onRefetchSales()}
            variant="ghost"
            className="border border-black cursor-pointer"
            disabled={isRefetchingSales || isSalesInfoFetching}
          >
            Update data
            {(isRefetchingSales || isSalesInfoFetching) && (
              <Loader2 className="animate-spin " />
            )}
          </Button>
        </div>

        <ScrollArea className="h-[calc(95vh-150px)] pr-4">
          {offlineSalesInfo && offlineSalesInfo.length > 0 && ticketInfo ? (
            <SalesSummary
              salesInfo={offlineSalesInfo}
              ticketInfo={ticketInfo}
              staffName={staffName}
              showTotalRevenue={false}
              getTicketColor={getTicketColor}
              hideFilters={true}
              isStaffSummary={true}
              totalRevenue={totalOfflineRevenue}
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
