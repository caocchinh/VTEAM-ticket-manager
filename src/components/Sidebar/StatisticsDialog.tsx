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

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartPie, Loader2 } from "lucide-react";
import { AllSalesInfo } from "@/constants/types";
import { VERIFICATION_APPROVED } from "@/constants/constants";
import ClassDistributionBarChart from "./Charts/ClassDistributionBarChart";
import TicketDistributionPieChart from "./Charts/TicketDistributionPieChart";
import PaymentDistributionPieChart from "./Charts/PaymentDistributionPieChart";
import StaffContributionBarChart from "./Charts/StaffContributionBarChart";
import { useState, useMemo } from "react";
import { SidebarMenuButton } from "../ui/sidebar";

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
      <DialogTrigger asChild>
        <SidebarMenuButton
          tooltip="Thống kê"
          className="bg-black active:bg-black text-white hover:bg-black hover:text-white cursor-pointer active:text-white"
          disabled={!salesInfo || isSalesInfoError}
        >
          <ChartPie />
          <span className="whitespace-nowrap">Statistics</span>
        </SidebarMenuButton>
      </DialogTrigger>

      <DialogContent className="h-[95dvh] gap-2 !py-2 !max-w-[100vw] w-[95vw]">
        <DialogTitle className="sr-only">Statistics</DialogTitle>
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-center font-semibold text-xl uppercase">
            Total{" "}
            {(salesInfo?.offline.length || 0) + verifiedOnlineOrders.length}{" "}
            orders
          </h3>
          <Separator orientation="vertical" />
          <Button
            onClick={onRefetchSales}
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
                  No offline data to display
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
                        Payment & staff contribution chart
                      </p>
                      <p className="text-sm">Only available for offline data</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  No verified online orders to display
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
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
