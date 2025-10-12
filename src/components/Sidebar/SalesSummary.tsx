import {
  OfflineSalesInfo,
  OnlineSalesInfo,
  TicketInfo,
} from "@/constants/types";

// Type guard to check if sales info is offline
const isOfflineSalesInfo = (
  sale: OfflineSalesInfo | OnlineSalesInfo
): sale is OfflineSalesInfo => {
  return "staffName" in sale && "paymentMedium" in sale;
};
import {
  cn,
  formatVietnameseCurrency,
  parseVietnameseCurrency,
} from "@/lib/utils";
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
import {
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Receipt,
  User,
  FileText,
  Mail,
  ChartNoAxesCombined,
  Search,
} from "lucide-react";
import SalesTrendChart from "@/components/Sidebar/Charts/SalesTrendChart";
import {
  format,
  isWithinInterval,
  parse,
  startOfDay,
  endOfDay,
} from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "../ui/badge";
import { FAILED_EMAIL_STATUS, SENT_EMAIL_STATUS } from "@/constants/constants";
import { ScrollArea } from "../ui/scroll-area";

interface SalesSummaryProps {
  salesInfo: OfflineSalesInfo[] | OnlineSalesInfo[];
  ticketInfo: TicketInfo[];
  totalRevenue: number;
  staffName?: string;
  isStaffSummary?: boolean;
  hideFilters?: boolean;
  showTotalRevenue?: boolean;
  getTicketColor: (ticketType: string) => string;
}

interface DailySummary {
  date: string;
  totalRevenue: number;
  totalOrders: number;
  cashOrders: number;
  transferOrders: number;
  onlineOrders: number;
  cashRevenue: number;
  transferRevenue: number;
  onlineRevenue: number;
  ticketBreakdown: Record<string, number>;
  ticketRevenueBreakdown: Record<string, number>;
  cashTicketBreakdown: Record<string, { count: number; revenue: number }>;
  transferTicketBreakdown: Record<string, { count: number; revenue: number }>;
  onlineTicketBreakdown: Record<string, { count: number; revenue: number }>;
  staffBreakdown: Record<string, { orders: number; revenue: number }>;
}

const SalesSummary = ({
  salesInfo,
  ticketInfo,
  totalRevenue,
  staffName,
  hideFilters = false,
  getTicketColor,
  isStaffSummary = false,
  showTotalRevenue = true,
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
    if (!salesInfo) return [];
    if (hideFilters) return salesInfo;
    if (!startDate || !endDate) return [];

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
  }, [salesInfo, startDate, endDate, hideFilters]);

  // Group sales by date for the render callback
  const salesByDate = useMemo(() => {
    if (!filteredSales.length) return {};

    const grouped: Record<string, (OfflineSalesInfo | OnlineSalesInfo)[]> = {};

    filteredSales.forEach((sale) => {
      try {
        const saleDate = parse(sale.time, "dd/MM/yyyy HH:mm:ss", new Date());
        if (isNaN(saleDate.getTime())) return;
        const dateKey = format(saleDate, "yyyy-MM-dd");

        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(sale);
      } catch {
        return;
      }
    });

    return grouped;
  }, [filteredSales]);

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
            onlineOrders: 0,
            cashRevenue: 0,
            transferRevenue: 0,
            onlineRevenue: 0,
            ticketBreakdown: {},
            ticketRevenueBreakdown: {},
            cashTicketBreakdown: {},
            transferTicketBreakdown: {},
            onlineTicketBreakdown: {},
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
        if (isOfflineSalesInfo(sale)) {
          const isCash = sale.paymentMedium === "Tiền mặt";
          if (isCash) {
            summary.cashOrders += 1;
            summary.cashRevenue += numericPrice;
          } else {
            summary.transferOrders += 1;
            summary.transferRevenue += numericPrice;
          }
        } else {
          // Online orders
          summary.onlineOrders += 1;
          summary.onlineRevenue += numericPrice;
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
        if (isOfflineSalesInfo(sale)) {
          const isCash = sale.paymentMedium === "Tiền mặt";
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
        } else {
          // Online orders
          if (!summary.onlineTicketBreakdown[sale.buyerTicketType]) {
            summary.onlineTicketBreakdown[sale.buyerTicketType] = {
              count: 0,
              revenue: 0,
            };
          }
          summary.onlineTicketBreakdown[sale.buyerTicketType].count += 1;
          summary.onlineTicketBreakdown[sale.buyerTicketType].revenue +=
            numericPrice;
        }

        // Update staff breakdown (only for offline sales)
        if (isOfflineSalesInfo(sale)) {
          if (!summary.staffBreakdown[sale.staffName]) {
            summary.staffBreakdown[sale.staffName] = { orders: 0, revenue: 0 };
          }
          summary.staffBreakdown[sale.staffName].orders += 1;
          summary.staffBreakdown[sale.staffName].revenue += numericPrice;
        }
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
        onlineOrders: acc.onlineOrders + day.onlineOrders,
        avgOrderValue: 0, // Will calculate after
      }),
      {
        totalRevenue: 0,
        totalOrders: 0,
        cashOrders: 0,
        transferOrders: 0,
        onlineOrders: 0,
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

  // Calculate overall ticket breakdown
  const overallTicketBreakdown = useMemo(() => {
    if (!summaryData || !totalSummary) return null;

    const ticketBreakdown: Record<string, number> = {};
    const ticketRevenueBreakdown: Record<string, number> = {};

    summaryData.forEach((day) => {
      Object.entries(day.ticketBreakdown).forEach(([ticket, count]) => {
        ticketBreakdown[ticket] = (ticketBreakdown[ticket] || 0) + count;
      });
      Object.entries(day.ticketRevenueBreakdown).forEach(
        ([ticket, revenue]) => {
          ticketRevenueBreakdown[ticket] =
            (ticketRevenueBreakdown[ticket] || 0) + revenue;
        }
      );
    });

    return {
      ticketBreakdown,
      ticketRevenueBreakdown,
    };
  }, [summaryData, totalSummary]);

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
      {!hideFilters && (
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
                  className={
                    isThisWeek ? "bg-[#0084ff] hover:bg-[#0084ff]" : ""
                  }
                >
                  Tuần này
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Summary */}
      {totalSummary && (
        <div className="flex flex-row gap-4 flex-wrap items-stretch h-full">
          {showTotalRevenue && (
            <Card className="min-w-[220px] flex-1">
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
          )}

          <Card className="min-w-[220px] flex-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng đơn hàng {isStaffSummary && "của bạn"}
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
                {totalSummary.onlineOrders > 0 && (
                  <span>, {totalSummary.onlineOrders} online</span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="min-w-[220px] flex-1">
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

          {currentStaffSummary &&
            salesInfo.some((sale) => isOfflineSalesInfo(sale)) && (
              <Card className="min-w-[220px] flex-1">
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
                          (currentStaffSummary.revenue / totalRevenue) * 100
                        )}
                        % tổng danh thu{" "}
                        {isOfflineSalesInfo(salesInfo[0])
                          ? "offline"
                          : "online"}
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>
            )}
        </div>
      )}

      {/* Overall Ticket Breakdown */}
      {overallTicketBreakdown && totalSummary && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isStaffSummary
                ? "Phân loại vé của bạn bán so với tổng VTEAM"
                : "Phân loại vé tổng quan"}
            </CardTitle>
            <CardDescription>
              Chi tiết số lượng và doanh thu theo từng loại vé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col w-full gap-6">
              {Object.entries(overallTicketBreakdown.ticketBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([ticketType, count]) => {
                  const revenue =
                    overallTicketBreakdown.ticketRevenueBreakdown[ticketType] ||
                    0;
                  const percentage = (revenue / totalRevenue) * 100;
                  return (
                    <div key={ticketType} className="space-y-1">
                      <div className="flex items-center justify-between text-sm flex-wrap gap-4">
                        <span className="font-medium">
                          {ticketType} ({" "}
                          {formatVietnameseCurrency(
                            parseVietnameseCurrency(
                              ticketInfo.find(
                                (ticket) => ticket.ticketName === ticketType
                              )?.price ?? 0
                            )
                          )}
                          ) -{" "}
                          {ticketInfo.find(
                            (ticket) => ticket.ticketName === ticketType
                          )?.includeConcert
                            ? "Có concert"
                            : "Không concert"}
                        </span>
                        <span className="text-muted-foreground">
                          {count} vé • Tổng {formatVietnameseCurrency(revenue)}
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: getTicketColor(ticketType),
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        {percentage.toFixed(1)}% tổng doanh thu{" "}
                        {isOfflineSalesInfo(salesInfo[0])
                          ? "offline"
                          : "online"}
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales Trend Chart */}
      {filteredSales &&
        filteredSales.length > 1 &&
        summaryData &&
        summaryData.length > 1 && (
          <SalesTrendChart
            salesInfo={filteredSales}
            ticketInfo={ticketInfo}
            staffName={staffName}
            showTotalRevenue={showTotalRevenue}
          />
        )}

      {/* Daily Breakdown */}
      {summaryData && summaryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết theo ngày</CardTitle>
            {!hideFilters && startDate && endDate && (
              <CardDescription>
                Từ {format(new Date(startDate), "dd/MM/yyyy", { locale: vi })}{" "}
                đến {format(new Date(endDate), "dd/MM/yyyy", { locale: vi })}
              </CardDescription>
            )}
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
                        {day.cashOrders > 0 && (
                          <div className="flex justify-between">
                            <span>• Tiền mặt:</span>
                            <span className="font-medium">
                              {formatVietnameseCurrency(day.cashRevenue)} (
                              {day.cashOrders} đơn)
                            </span>
                          </div>
                        )}
                        {day.transferOrders > 0 && (
                          <div className="flex justify-between">
                            <span>• Chuyển khoản:</span>
                            <span className="font-medium">
                              {formatVietnameseCurrency(day.transferRevenue)} (
                              {day.transferOrders} đơn)
                            </span>
                          </div>
                        )}
                        {day.onlineOrders > 0 && (
                          <div className="flex justify-between">
                            <span>• Online:</span>
                            <span className="font-medium">
                              {formatVietnameseCurrency(day.onlineRevenue)} (
                              {day.onlineOrders} đơn)
                            </span>
                          </div>
                        )}
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
                        <div className="flex items-center gap-2">
                          <ChartNoAxesCombined className="h-4 w-4" />
                          Chi tiết theo loại vé và hình thức thanh toán
                        </div>
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

                          {/* Online Payment Details */}
                          {day.onlineRevenue > 0 && (
                            <div>
                              <h5 className="font-medium text-sm mb-2 text-purple-700">
                                Online -{" "}
                                {formatVietnameseCurrency(day.onlineRevenue)}
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {Object.entries(day.onlineTicketBreakdown)
                                  .sort(([, a], [, b]) => b.revenue - a.revenue)
                                  .map(([ticket, data]) => {
                                    const ticketPrice =
                                      ticketInfo.find(
                                        (info) => ticket === info.ticketName
                                      )?.price ?? "0";
                                    return (
                                      <div
                                        key={`online-${ticket}`}
                                        className="flex justify-between bg-purple-50 p-2 rounded"
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

                  <>
                    <Separator />
                    <DailyOrders
                      dateString={day.date}
                      ticketInfo={ticketInfo}
                      getTicketColor={getTicketColor}
                      dailySales={salesByDate[day.date] || []}
                    />
                  </>

                  {index < summaryData.length - 1 && (
                    <Separator className="mt-4 bg-[#0084ff]" />
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

const DailyOrders = ({
  dateString,
  ticketInfo,
  getTicketColor,
  dailySales,
}: {
  dateString: string;
  ticketInfo: TicketInfo[];
  getTicketColor: (ticketType: string) => string;
  dailySales: (OfflineSalesInfo | OnlineSalesInfo)[];
}) => {
  // Fuzzy search function - checks if search characters appear in order in target
  const fuzzyMatch = (search: string, target: string): boolean => {
    const searchLower = search.toLowerCase();
    const targetLower = target.toLowerCase();
    let searchIndex = 0;

    for (
      let i = 0;
      i < targetLower.length && searchIndex < searchLower.length;
      i++
    ) {
      if (targetLower[i] === searchLower[searchIndex]) {
        searchIndex++;
      }
    }

    return searchIndex === searchLower.length;
  };

  // Sort orders by time (most recent first)
  const sortedOrders = [...dailySales].sort((a, b) => {
    const dateA = parse(a.time, "dd/MM/yyyy HH:mm:ss", new Date());
    const dateB = parse(b.time, "dd/MM/yyyy HH:mm:ss", new Date());
    return dateB.getTime() - dateA.getTime();
  });
  const [searchInput, setSearchInput] = useState("");
  const filteredOrders = useMemo(() => {
    if (!searchInput) return sortedOrders;
    return sortedOrders.filter(
      (order) =>
        fuzzyMatch(searchInput, order.buyerName) ||
        fuzzyMatch(searchInput, order.buyerId)
    );
  }, [searchInput, sortedOrders]);

  return (
    <div className="flex flex-col gap-2 mt-0">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="order">
          <AccordionTrigger className="cursor-pointer">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Chi tiết từng đơn hàng ({sortedOrders.length} đơn)
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-1">
            <div className="relative">
              <Search
                className="absolute top-1/2 left-2 -translate-y-1/2"
                size={15}
              />
              <Input
                placeholder="Tìm kiếm theo tên/mã số HS khách hàng"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-7"
              />
            </div>
            <ScrollArea className="h-[50vh] pr-5 w-full" type="always">
              <div>
                <Accordion type="multiple" className="w-full">
                  {filteredOrders.map((order, orderIndex) => {
                    const ticketPrice =
                      ticketInfo?.find(
                        (info) => order.buyerTicketType === info.ticketName
                      )?.price ?? "0";
                    const numericPrice = parseVietnameseCurrency(ticketPrice);
                    const itemId = `order-${dateString}-${orderIndex}-${order.buyerId}`;

                    return (
                      <AccordionItem
                        key={`${order.buyerId}-${order.time}-${orderIndex}`}
                        value={itemId}
                      >
                        <AccordionTrigger className="cursor-pointer">
                          <div className="flex items-center justify-between w-full pr-4 flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                              {orderIndex + 1}.
                              <div className="text-left">
                                <div className="font-medium">
                                  {order.buyerName} - {order.buyerId}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {order.time} •{" "}
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
                                  (isOfflineSalesInfo(order)
                                    ? order.paymentMedium
                                    : order.verificationStatus) === "Tiền mặt"
                                    ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
                                    : "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                                )}
                              >
                                {isOfflineSalesInfo(order)
                                  ? order.paymentMedium
                                  : order.verificationStatus}
                              </Badge>
                              <span className="font-semibold">
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
                                    <div className="font-medium">
                                      {order.buyerName}
                                    </div>
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
                            <>
                              <Separator />
                              <div className="space-y-2">
                                {isOfflineSalesInfo(order) && (
                                  <div className="flex items-start gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div className="flex-1">
                                      <div className="text-xs text-muted-foreground">
                                        Ghi chú:{" "}
                                        {order.buyerNotice ||
                                          "Không có ghi chú"}
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
                                          order.emailStatus ===
                                            SENT_EMAIL_STATUS
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
                                {isOfflineSalesInfo(order) &&
                                  order.staffName && (
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-muted-foreground" />
                                      <div className="text-xs">
                                        <span className="text-muted-foreground">
                                          Staff điền form: {order.staffName}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
