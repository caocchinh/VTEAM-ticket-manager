import { SquareUserRound, Receipt, Mail, User, FileText } from "lucide-react";
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
import {
  OfflineSalesInfo,
  OnlineSalesInfo,
  TicketInfo,
} from "@/constants/types";
import { Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import {
  formatVietnameseCurrency,
  parseVietnameseCurrency,
  cn,
} from "@/lib/utils";
import { parse, format } from "date-fns";
import { vi } from "date-fns/locale";
import { ScrollArea } from "../ui/scroll-area";
import SalesSummary from "./SalesSummary";
import { SENT_EMAIL_STATUS, FAILED_EMAIL_STATUS } from "@/constants/constants";
import { Badge } from "../ui/badge";

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

// Type guard to check if sales info is offline
const isOfflineSalesInfo = (
  sale: OfflineSalesInfo | OnlineSalesInfo
): sale is OfflineSalesInfo => {
  return "staffName" in sale && "paymentMedium" in sale;
};

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
  const renderOrderDetails = (
    dateString: string,
    dailySales: (OfflineSalesInfo | OnlineSalesInfo)[]
  ) => {
    // Filter to only include offline sales
    const offlineSales = dailySales.filter(isOfflineSalesInfo);
    // Convert yyyy-MM-dd to dd/MM/yyyy for matching

    // Sort orders by time (most recent first)
    const sortedOrders = [...offlineSales].sort((a, b) => {
      const dateA = parse(a.time, "dd/MM/yyyy HH:mm:ss", new Date());
      const dateB = parse(b.time, "dd/MM/yyyy HH:mm:ss", new Date());
      return dateB.getTime() - dateA.getTime();
    });

    return (
      <div className="flex flex-col gap-2 mt-6">
        <div className="text-sm font-medium flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          Chi tiết từng đơn hàng
        </div>
        <Accordion type="single" collapsible className="w-full">
          {sortedOrders.map((order, orderIndex) => {
            const orderDate = parse(
              order.time,
              "dd/MM/yyyy HH:mm:ss",
              new Date()
            );
            const formattedTime = format(orderDate, "HH:mm:ss", {
              locale: vi,
            });
            const ticketPrice =
              ticketInfo?.find(
                (info) => order.buyerTicketType === info.ticketName
              )?.price ?? "0";
            const numericPrice = parseVietnameseCurrency(ticketPrice);

            return (
              <AccordionItem
                key={`${order.buyerId}-${order.time}-${orderIndex}`}
                value={`order-${dateString}-${orderIndex}`}
              >
                <AccordionTrigger className="cursor-pointer py-2">
                  <div className="flex items-center justify-between w-full pr-4 flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      {orderIndex + 1}.
                      <div className="text-left">
                        <div className="font-medium">
                          {order.buyerName} - {order.buyerId}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formattedTime} •{" "}
                          <Badge
                            style={{
                              backgroundColor: getTicketColor(
                                order.buyerTicketType
                              ),
                            }}
                          >
                            {order.buyerTicketType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          "text-xs",
                          order.paymentMedium === "Tiền mặt"
                            ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
                            : "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                        )}
                      >
                        {order.paymentMedium}
                      </Badge>
                      <span className="font-bold">
                        {formatVietnameseCurrency(numericPrice)}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="border rounded-lg p-3 space-y-3 bg-muted/30 mt-2">
                    {/* Customer Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground">
                              Khách hàng
                            </div>
                            <div className="font-medium">{order.buyerName}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground">
                              Lớp
                            </div>
                            <div className="font-medium">
                              {order.buyerClass}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Receipt className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground">
                              Mã học sinh
                            </div>
                            <div className="font-medium font-mono">
                              {order.buyerId}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground">
                              Email
                            </div>
                            <div className="font-medium text-sm break-all">
                              {order.buyerEmail}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notice and Email Status */}
                    {(order.buyerNotice || order.emailStatus) && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          {order.buyerNotice && (
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div className="flex-1">
                                <div className="text-xs text-muted-foreground">
                                  Ghi chú
                                </div>
                                <div className="text-sm bg-background p-2 rounded mt-1">
                                  {order.buyerNotice}
                                </div>
                              </div>
                            </div>
                          )}
                          {order.emailStatus && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <div className="text-xs">
                                <span className="text-muted-foreground">
                                  Trạng thái gửi email xác nhận vé:{" "}
                                </span>
                                <span
                                  className={cn(
                                    "font-medium",
                                    order.emailStatus === SENT_EMAIL_STATUS
                                      ? "text-green-600 dark:text-green-400"
                                      : order.emailStatus ===
                                        FAILED_EMAIL_STATUS
                                      ? "text-red-600 dark:text-red-400"
                                      : "text-amber-600 dark:text-amber-400"
                                  )}
                                >
                                  {order.emailStatus}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    );
  };

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
              renderDailyExtraContent={renderOrderDetails}
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
