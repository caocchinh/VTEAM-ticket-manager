"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartSpline, Loader2 } from "lucide-react";
import { VERIFICATION_APPROVED } from "@/constants/constants";
import { AllSalesInfo, AllTicketInfo, Staff } from "@/constants/types";
import SalesSummary from "@/components/SalesSummary";
import { Dispatch, SetStateAction } from "react";

interface SalesSummaryDialogProps {
  isOpen: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  salesInfo: AllSalesInfo | undefined;
  ticketInfo: AllTicketInfo | undefined;
  staffInfo: Staff;
  isSalesInfoError: boolean;
  isRefetchingSales: boolean;
  isSalesInfoFetching: boolean;
  onRefetchSales: () => void;
}

const SalesSummaryDialog = ({
  isOpen,
  onOpenChange,
  salesInfo,
  ticketInfo,
  staffInfo,
  isSalesInfoError,
  isRefetchingSales,
  isSalesInfoFetching,
  onRefetchSales,
}: SalesSummaryDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              className="cursor-pointer w-[35px] !bg-[#0084ff] !text-white"
              disabled={!salesInfo || isSalesInfoError}
              variant="outline"
            >
              <ChartSpline />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent
          className="!bg-[#0084ff] !text-white "
          arrowClassName="fill-[#0084ff] bg-[#0084ff]"
        >
          Báo cáo doanh thu
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-[95vh] !py-2 !max-w-[100vw] w-[90vw]">
        <DialogTitle className="sr-only">Báo cáo doanh thu</DialogTitle>
        <DialogDescription className="sr-only">
          Báo cáo doanh thu bán vé
        </DialogDescription>
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-center font-semibold text-xl uppercase">
            Báo cáo doanh thu
          </h3>
          <Separator orientation="vertical" />
          <Button
            onClick={() => onRefetchSales()}
            variant="ghost"
            className="border border-black cursor-pointer"
            disabled={isRefetchingSales || isSalesInfoFetching}
          >
            Cập nhật dữ liệu
            {isRefetchingSales && <Loader2 className="animate-spin " />}
          </Button>
        </div>
        <Tabs defaultValue="offline" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="offline">
              Offline ({salesInfo?.offline.length || 0})
            </TabsTrigger>
            <TabsTrigger value="online">
              Online (
              {salesInfo?.online.filter(
                (order) => order.hasBeenVerified === VERIFICATION_APPROVED
              ).length || 0}
              )
            </TabsTrigger>
          </TabsList>

          <TabsContent value="offline" className="mt-4">
            <ScrollArea className="h-[65dvh] pr-4 w-full" type="always">
              {salesInfo && salesInfo.offline.length > 0 && ticketInfo ? (
                <SalesSummary
                  salesInfo={salesInfo.offline}
                  ticketInfo={ticketInfo.offline}
                  staffName={staffInfo.name}
                />
              ) : (
                <div className="flex items-center justify-center">
                  Không có đủ dữ kiện offline để trình bày
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="online" className="mt-4">
            <ScrollArea className="h-[65dvh] pr-4 w-full" type="always">
              {salesInfo &&
              salesInfo.online.filter(
                (order) => order.hasBeenVerified === VERIFICATION_APPROVED
              ).length > 0 &&
              ticketInfo ? (
                <SalesSummary
                  salesInfo={salesInfo.online.filter(
                    (order) => order.hasBeenVerified === VERIFICATION_APPROVED
                  )}
                  ticketInfo={ticketInfo.online}
                  staffName={staffInfo.name}
                />
              ) : (
                <div className="flex items-center justify-center">
                  Không có đủ dữ kiện online đã xác minh để trình bày
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button
            variant="outline"
            className="w-full cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SalesSummaryDialog;
