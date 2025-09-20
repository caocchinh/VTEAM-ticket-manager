import { SalesInfo, TicketInfo } from "@/constants/types";
import { formatVietnameseCurrency, parseVietnameseCurrency } from "@/lib/utils";
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar, TrendingUp, Users, DollarSign, Clock } from "lucide-react";
import SalesTrendChart from "@/components/SalesTrendChart";
import {
  format,
  isWithinInterval,
  parse,
  startOfDay,
  endOfDay,
} from "date-fns";
import { vi } from "date-fns/locale";

interface SalesSummaryProps {
  salesInfo: SalesInfo[];
  ticketInfo: TicketInfo[];
  staffName?: string;
}

interface DailySummary {
  date: string;
  totalRevenue: number;
  totalOrders: number;
  cashOrders: number;
  transferOrders: number;
  cashRevenue: number;
  transferRevenue: number;
  ticketBreakdown: Record<string, number>;
  ticketRevenueBreakdown: Record<string, number>;
  cashTicketBreakdown: Record<string, { count: number; revenue: number }>;
  transferTicketBreakdown: Record<string, { count: number; revenue: number }>;
  staffBreakdown: Record<string, { orders: number; revenue: number }>;
}

const SalesSummary = ({
  salesInfo,
  ticketInfo,
  staffName,
}: SalesSummaryProps) => {
  // Get date range for all data
  const allDataRange = useMemo(() => {
    if (!salesInfo || salesInfo.length === 0) return null;

    const dates = salesInfo
      .map((sale) => {
        try {
          const parsedDate = parse(
            sale.time,
            "dd/MM/yyyy HH:mm:ss",
            new Date()
          );
          // Check if the parsed date is valid
          if (isNaN(parsedDate.getTime())) {
            return null;
          }
          return parsedDate;
        } catch {
          return null;
        }
      })
      .filter((date): date is Date => date !== null && !isNaN(date.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    if (dates.length === 0) return null;

    return {
      earliest: format(dates[0], "yyyy-MM-dd"),
      latest: format(dates[dates.length - 1], "yyyy-MM-dd"),
    };
  }, [salesInfo]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Set default dates to all data range when data is available
  useEffect(() => {
    if (allDataRange && !startDate && !endDate) {
      setStartDate(allDataRange.earliest);
      setEndDate(allDataRange.latest);
    }
  }, [allDataRange, startDate, endDate]);

  // Check if current date range matches "today"
  const isToday = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return startDate === today && endDate === today;
  }, [startDate, endDate]);

  // Check if current date range matches "this week"
  const isThisWeek = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const expectedStartDate = format(startOfWeek, "yyyy-MM-dd");
    const expectedEndDate = format(today, "yyyy-MM-dd");

    return startDate === expectedStartDate && endDate === expectedEndDate;
  }, [startDate, endDate]);

  // Check if current date range matches "all data"
  const isAllData = useMemo(() => {
    if (!allDataRange) return false;
    return (
      startDate === allDataRange.earliest && endDate === allDataRange.latest
    );
  }, [startDate, endDate, allDataRange]);

  const filteredSales = useMemo(() => {
    if (!salesInfo || !startDate || !endDate) return [];

    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    return salesInfo.filter((sale) => {
      try {
        // Parse DD/MM/YYYY HH:mm:ss format
        const saleDate = parse(sale.time, "dd/MM/yyyy HH:mm:ss", new Date());
        // Check if the parsed date is valid
        if (isNaN(saleDate.getTime())) {
          return false;
        }
        return isWithinInterval(saleDate, { start, end });
      } catch {
        return false;
      }
    });
  }, [salesInfo, startDate, endDate]);

  const summaryData = useMemo(() => {
    if (!filteredSales.length || !ticketInfo) return null;

    const dailySummaries: Record<string, DailySummary> = {};

    filteredSales.forEach((sale) => {
      try {
        // Parse DD/MM/YYYY HH:mm:ss format
        const saleDate = parse(sale.time, "dd/MM/yyyy HH:mm:ss", new Date());
        // Check if the parsed date is valid
        if (isNaN(saleDate.getTime())) {
          console.error("Invalid date found:", sale.time);
          return;
        }
        const dateKey = format(saleDate, "yyyy-MM-dd");

        if (!dailySummaries[dateKey]) {
          dailySummaries[dateKey] = {
            date: dateKey,
            totalRevenue: 0,
            totalOrders: 0,
            cashOrders: 0,
            transferOrders: 0,
            cashRevenue: 0,
            transferRevenue: 0,
            ticketBreakdown: {},
            ticketRevenueBreakdown: {},
            cashTicketBreakdown: {},
            transferTicketBreakdown: {},
            staffBreakdown: {},
          };
        }

        const summary = dailySummaries[dateKey];
        const ticketPrice =
          ticketInfo.find((info) => sale.buyerTicketType === info.ticketName)
            ?.price ?? 0;
        const numericPrice = parseVietnameseCurrency(ticketPrice);

        // Update totals
        summary.totalRevenue += numericPrice;
        summary.totalOrders += 1;

        // Update payment method counts and revenue
        const isCash = sale.paymentMedium === "Tiền mặt";
        if (isCash) {
          summary.cashOrders += 1;
          summary.cashRevenue += numericPrice;
        } else {
          summary.transferOrders += 1;
          summary.transferRevenue += numericPrice;
        }

        // Update ticket breakdown (count)
        if (!summary.ticketBreakdown[sale.buyerTicketType]) {
          summary.ticketBreakdown[sale.buyerTicketType] = 0;
        }
        summary.ticketBreakdown[sale.buyerTicketType] += 1;

        // Update ticket revenue breakdown
        if (!summary.ticketRevenueBreakdown[sale.buyerTicketType]) {
          summary.ticketRevenueBreakdown[sale.buyerTicketType] = 0;
        }
        summary.ticketRevenueBreakdown[sale.buyerTicketType] += numericPrice;

        // Update payment method specific ticket breakdown
        const ticketBreakdownKey = isCash
          ? "cashTicketBreakdown"
          : "transferTicketBreakdown";
        if (!summary[ticketBreakdownKey][sale.buyerTicketType]) {
          summary[ticketBreakdownKey][sale.buyerTicketType] = {
            count: 0,
            revenue: 0,
          };
        }
        summary[ticketBreakdownKey][sale.buyerTicketType].count += 1;
        summary[ticketBreakdownKey][sale.buyerTicketType].revenue +=
          numericPrice;

        // Update staff breakdown
        if (!summary.staffBreakdown[sale.staffName]) {
          summary.staffBreakdown[sale.staffName] = { orders: 0, revenue: 0 };
        }
        summary.staffBreakdown[sale.staffName].orders += 1;
        summary.staffBreakdown[sale.staffName].revenue += numericPrice;
      } catch (error) {
        console.error("Error processing sale:", error);
      }
    });

    return Object.values(dailySummaries).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [filteredSales, ticketInfo]);

  const totalSummary = useMemo(() => {
    if (!summaryData) return null;

    return summaryData.reduce(
      (acc, day) => ({
        totalRevenue: acc.totalRevenue + day.totalRevenue,
        totalOrders: acc.totalOrders + day.totalOrders,
        cashOrders: acc.cashOrders + day.cashOrders,
        transferOrders: acc.transferOrders + day.transferOrders,
        avgOrderValue: 0, // Will calculate after
      }),
      {
        totalRevenue: 0,
        totalOrders: 0,
        cashOrders: 0,
        transferOrders: 0,
        avgOrderValue: 0,
      }
    );
  }, [summaryData]);

  if (totalSummary) {
    totalSummary.avgOrderValue =
      totalSummary.totalOrders > 0
        ? totalSummary.totalRevenue / totalSummary.totalOrders
        : 0;
  }

  const currentStaffSummary = useMemo(() => {
    if (!summaryData || !staffName) return null;

    return summaryData.reduce(
      (acc, day) => {
        const staffData = day.staffBreakdown[staffName];
        if (staffData) {
          acc.orders += staffData.orders;
          acc.revenue += staffData.revenue;
        }
        return acc;
      },
      { orders: 0, revenue: 0 }
    );
  }, [summaryData, staffName]);

  const setToday = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    setStartDate(today);
    setEndDate(today);
  };

  const setThisWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    setStartDate(format(startOfWeek, "yyyy-MM-dd"));
    setEndDate(format(today, "yyyy-MM-dd"));
  };

  const setAllData = () => {
    if (allDataRange) {
      setStartDate(allDataRange.earliest);
      setEndDate(allDataRange.latest);
    }
  };

  return (
    <div className="space-y-4">
      {/* Date Range Controls */}
      <Card className="flex flex-row flex-wrap items-center justify-center sm:justify-start">
        <CardHeader className="min-w-[245px]">
          <CardTitle className="flex items-center gap-2 justify-center sm:justify-start">
            <Calendar size={20} />
            Chọn khoảng thời gian
          </CardTitle>
        </CardHeader>
        <Separator
          orientation="vertical"
          className="!h-[55px] w-1 mx-3 block"
          id="day_picker_separ"
        />
        <CardContent>
          <div className="flex flex-wrap items-end gap-4 justify-center sm:justify-start">
            <div className="flex flex-col gap-2">
              <Label htmlFor="start-date">Từ ngày</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="end-date">Đến ngày</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={isAllData ? "default" : "outline"}
                onClick={setAllData}
                size="sm"
                disabled={!allDataRange}
                className={isAllData ? "bg-[#0084ff] hover:bg-[#0084ff]" : ""}
              >
                Tất cả
              </Button>
              <Button
                variant={isToday ? "default" : "outline"}
                onClick={setToday}
                size="sm"
                className={isToday ? "bg-[#0084ff] hover:bg-[#0084ff]" : ""}
              >
                Hôm nay
              </Button>
              <Button
                variant={isThisWeek ? "default" : "outline"}
                onClick={setThisWeek}
                size="sm"
                className={isThisWeek ? "bg-[#0084ff] hover:bg-[#0084ff]" : ""}
              >
                Tuần này
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Summary */}
      {totalSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng doanh thu
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatVietnameseCurrency(totalSummary.totalRevenue)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng đơn hàng
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalSummary.totalOrders}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalSummary.cashOrders} tiền mặt,{" "}
                {totalSummary.transferOrders} chuyển khoản
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Giá trị TB/đơn
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatVietnameseCurrency(totalSummary.avgOrderValue)}
              </div>
            </CardContent>
          </Card>

          {currentStaffSummary && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Doanh thu của bạn
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#0084ff]">
                  {formatVietnameseCurrency(currentStaffSummary.revenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentStaffSummary.orders} đơn hàng
                  {totalSummary.totalRevenue > 0 && (
                    <span>
                      {" "}
                      •{" "}
                      {Math.round(
                        (currentStaffSummary.revenue /
                          totalSummary.totalRevenue) *
                          100
                      )}
                      % tổng
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Sales Trend Chart */}
      {filteredSales && filteredSales.length > 1 && (
        <SalesTrendChart
          salesInfo={filteredSales}
          ticketInfo={ticketInfo}
          staffName={staffName}
        />
      )}

      {/* Daily Breakdown */}
      {summaryData && summaryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết theo ngày</CardTitle>
            <CardDescription>
              Từ {format(new Date(startDate), "dd/MM/yyyy", { locale: vi })} đến{" "}
              {format(new Date(endDate), "dd/MM/yyyy", { locale: vi })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summaryData.map((day, index) => (
                <div key={day.date}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">
                      {format(new Date(day.date), "EEEE, dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </h4>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {formatVietnameseCurrency(day.totalRevenue)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {day.totalOrders} đơn
                      </div>
                    </div>
                  </div>

                  <div className="flex items-stretch justify-center gap-4 md:gap-2 flex-col md:flex-row text-sm mb-4">
                    <div className="w-full md:w-1/2">
                      <p className="font-medium mb-2">Hình thức thanh toán:</p>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>• Tiền mặt:</span>
                          <span className="font-medium">
                            {formatVietnameseCurrency(day.cashRevenue)} (
                            {day.cashOrders} đơn)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Chuyển khoản:</span>
                          <span className="font-medium">
                            {formatVietnameseCurrency(day.transferRevenue)} (
                            {day.transferOrders} đơn)
                          </span>
                        </div>
                      </div>
                    </div>
                    <Separator
                      orientation="vertical"
                      className="!h-[100px] w-1 mx-3 hidden md:block"
                    />

                    <div className="w-full md:w-1/2">
                      <p className="font-medium mb-2">Tổng quan loại vé:</p>
                      <div className="space-y-1">
                        {Object.entries(day.ticketBreakdown)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 3)
                          .map(([ticket, count]) => (
                            <div key={ticket} className="flex justify-between">
                              <span>• {ticket}:</span>
                              <span className="font-medium">{count} vé</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={`details-${day.date}`}>
                      <AccordionTrigger className="text-sm cursor-pointer">
                        Chi tiết theo loại vé và hình thức thanh toán
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          {/* Cash Payment Details */}
                          {day.cashRevenue > 0 && (
                            <div>
                              <h5 className="font-medium text-sm mb-2 text-green-700">
                                Tiền mặt -{" "}
                                {formatVietnameseCurrency(day.cashRevenue)}
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {Object.entries(day.cashTicketBreakdown)
                                  .sort(([, a], [, b]) => b.revenue - a.revenue)
                                  .map(([ticket, data]) => {
                                    const ticketPrice =
                                      ticketInfo.find(
                                        (info) => ticket === info.ticketName
                                      )?.price ?? "0";
                                    return (
                                      <div
                                        key={`cash-${ticket}`}
                                        className="flex justify-between bg-green-50 p-2 rounded"
                                      >
                                        <span>
                                          {ticket} ({ticketPrice}):
                                        </span>
                                        <span className="font-medium">
                                          {formatVietnameseCurrency(
                                            data.revenue
                                          )}{" "}
                                          ({data.count} vé)
                                        </span>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}

                          {/* Transfer Payment Details */}
                          {day.transferRevenue > 0 && (
                            <div>
                              <h5 className="font-medium text-sm mb-2 text-blue-700">
                                Chuyển khoản -{" "}
                                {formatVietnameseCurrency(day.transferRevenue)}
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {Object.entries(day.transferTicketBreakdown)
                                  .sort(([, a], [, b]) => b.revenue - a.revenue)
                                  .map(([ticket, data]) => {
                                    const ticketPrice =
                                      ticketInfo.find(
                                        (info) => ticket === info.ticketName
                                      )?.price ?? "0";
                                    return (
                                      <div
                                        key={`transfer-${ticket}`}
                                        className="flex justify-between bg-blue-50 p-2 rounded"
                                      >
                                        <span>
                                          {ticket} ({ticketPrice}):
                                        </span>
                                        <span className="font-medium">
                                          {formatVietnameseCurrency(
                                            data.revenue
                                          )}{" "}
                                          ({data.count} vé)
                                        </span>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {index < summaryData.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(!summaryData || summaryData.length === 0) && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Không có dữ liệu bán vé trong khoảng thời gian đã chọn
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SalesSummary;
