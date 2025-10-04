"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartPie, Loader2 } from "lucide-react";
import { AllSalesInfo } from "@/constants/types";
import { VERIFICATION_APPROVED } from "@/constants/constants";
import ClassDistributionBarChart from "./ClassDistributionBarChart";
import TicketDistributionPieChart from "./TicketDistributionPieChart";
import PaymentDistributionPieChart from "./PaymentDistributionPieChart";
import StaffContributionBarChart from "./StaffContributionBarChart";
import { useState, useMemo } from "react";

interface StatisticsDialogProps {
  salesInfo: AllSalesInfo | undefined;
  isSalesInfoError: boolean;
  isSalesInfoFetching: boolean;
  onRefetchSales: () => void;
  isRefetchingSales: boolean;
}

export default function StatisticsDialog({
  salesInfo,
  isSalesInfoError,
  isSalesInfoFetching,
  onRefetchSales,
  isRefetchingSales,
}: StatisticsDialogProps) {
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);

  // Filter online orders to only include verified ones
  const verifiedOnlineOrders = useMemo(() => {
    if (!salesInfo?.online) return [];
    return salesInfo.online.filter(
      (order) => order.verificationStatus === VERIFICATION_APPROVED
    );
  }, [salesInfo?.online]);

  return (
    <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              className="cursor-pointer w-[35px] -mr-2"
              disabled={!salesInfo || isSalesInfoError}
            >
              <ChartPie />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Xem thống kê</TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-[95vh] !py-2 !max-w-[100vw] w-[90vw]">
        <DialogTitle className="sr-only">Thống kê</DialogTitle>
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-center font-semibold text-xl uppercase">
            Tổng{" "}
            {(salesInfo?.offline.length || 0) + verifiedOnlineOrders.length} đơn
          </h3>
          <Separator orientation="vertical" />
          <Button
            onClick={onRefetchSales}
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
              Online ({verifiedOnlineOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="offline" className="mt-4">
            <ScrollArea className="h-[65dvh] pr-4 w-full" type="always">
              {salesInfo && salesInfo.offline.length > 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                  <ClassDistributionBarChart salesInfo={salesInfo.offline} />
                  <TicketDistributionPieChart salesInfo={salesInfo.offline} />
                  <PaymentDistributionPieChart salesInfo={salesInfo.offline} />
                  <StaffContributionBarChart salesInfo={salesInfo.offline} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  Không có dữ liệu offline để trình bày
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="online" className="mt-4">
            <ScrollArea className="h-[65dvh] pr-4 w-full" type="always">
              {verifiedOnlineOrders.length > 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                  <ClassDistributionBarChart salesInfo={verifiedOnlineOrders} />
                  <TicketDistributionPieChart
                    salesInfo={verifiedOnlineOrders}
                  />
                  <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center text-gray-500">
                      <p className="font-medium">
                        Biểu đồ thanh toán & đóng góp nhân viên
                      </p>
                      <p className="text-sm">
                        Chỉ khả dụng cho dữ liệu offline
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  Không có đơn online đã xác minh để trình bày
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button
            variant="outline"
            className="w-full cursor-pointer"
            onClick={() => setIsStatsDialogOpen(false)}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
