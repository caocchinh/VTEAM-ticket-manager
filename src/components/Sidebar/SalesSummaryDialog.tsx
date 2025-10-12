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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartSpline, Loader2 } from "lucide-react";
import { VERIFICATION_APPROVED } from "@/constants/constants";
import { AllSalesInfo, AllTicketInfo, Staff } from "@/constants/types";
import SalesSummary from "@/components/Sidebar/SalesSummary";
import { useState } from "react";
import { SidebarMenuButton } from "../ui/sidebar";

interface SalesSummaryDialogProps {
  totalOfflineRevenue: number;
  totalOnlineRevenue: number;
  salesInfo: AllSalesInfo | undefined;
  ticketInfo: AllTicketInfo | undefined;
  staffInfo: Staff;
  isSalesInfoError: boolean;
  isRefetchingSales: boolean;
  isSalesInfoFetching: boolean;
  onRefetchSales: () => void;
  getTicketColor: (ticketType: string) => string;
}

const SalesSummaryDialog = ({
  salesInfo,
  ticketInfo,
  staffInfo,
  isSalesInfoError,
  totalOfflineRevenue,
  totalOnlineRevenue,
  getTicketColor,
  isRefetchingSales,
  isSalesInfoFetching,
  onRefetchSales,
}: SalesSummaryDialogProps) => {
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);

  return (
    <Dialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
      <DialogTrigger asChild>
        <SidebarMenuButton
          tooltip="Báo cáo doanh thu"
          className="bg-[#0084ff] text-white active:bg-[#0084ff] hover:bg-[#0084ff] hover:text-white cursor-pointer active:text-white"
          disabled={!salesInfo || isSalesInfoError}
        >
          <ChartSpline />
          <span className="whitespace-nowrap"> Báo cáo tổng doanh thu</span>
        </SidebarMenuButton>
      </DialogTrigger>

      <DialogContent className="h-[97dvh] gap-2 !py-2 !max-w-[100vw] w-[95vw]">
        <DialogTitle className="sr-only">Báo cáo tổng doanh thu</DialogTitle>
        <DialogDescription className="sr-only">
          Báo cáo tổng doanh thu bán vé
        </DialogDescription>
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-center font-semibold text-xl uppercase">
            Báo cáo tổng doanh thu
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
        <Tabs defaultValue="offline" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="offline">
              Offline ({salesInfo?.offline.length || 0})
            </TabsTrigger>
            <TabsTrigger value="online">
              Online (
              {salesInfo?.online.filter(
                (order) => order.verificationStatus === VERIFICATION_APPROVED
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
                  totalRevenue={totalOfflineRevenue}
                  staffName={staffInfo.name}
                  getTicketColor={getTicketColor}
                />
              ) : (
                <div className="flex items-center justify-center text-center">
                  Không có đủ dữ kiện offline để trình bày
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="online" className="mt-4">
            <ScrollArea className="h-[65dvh] pr-4 w-full" type="always">
              {salesInfo &&
              salesInfo.online.filter(
                (order) => order.verificationStatus === VERIFICATION_APPROVED
              ).length > 0 &&
              ticketInfo ? (
                <SalesSummary
                  salesInfo={salesInfo.online.filter(
                    (order) =>
                      order.verificationStatus === VERIFICATION_APPROVED
                  )}
                  ticketInfo={ticketInfo.online}
                  totalRevenue={totalOnlineRevenue}
                  staffName={staffInfo.name}
                  getTicketColor={getTicketColor}
                />
              ) : (
                <div className="flex items-center justify-center text-center">
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
            onClick={() => setIsSummaryDialogOpen(false)}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SalesSummaryDialog;
