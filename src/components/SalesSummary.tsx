import { SalesInfo, TicketInfo } from "@/constants/types";
import { formatVietnameseCurrency, parseVietnameseCurrency } from "@/lib/utils";
import { useMemo, useState } from "react";
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
  ticketBreakdown: Record<string, number>;
  staffBreakdown: Record<string, { orders: number; revenue: number }>;
}

const SalesSummary = ({
  salesInfo,
  ticketInfo,
  staffName,
}: SalesSummaryProps) => {
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return format(today, "yyyy-MM-dd");
  });

  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return format(today, "yyyy-MM-dd");
  });

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

  const filteredSales = useMemo(() => {
    if (!salesInfo || !startDate || !endDate) return [];

    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    return salesInfo.filter((sale) => {
      try {
        // Parse DD/MM/YYYY HH:mm:ss format
        const saleDate = parse(sale.time, "dd/MM/yyyy HH:mm:ss", new Date());
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
        const dateKey = format(saleDate, "yyyy-MM-dd");

        if (!dailySummaries[dateKey]) {
          dailySummaries[dateKey] = {
            date: dateKey,
            totalRevenue: 0,
            totalOrders: 0,
            cashOrders: 0,
            transferOrders: 0,
            ticketBreakdown: {},
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

        // Update payment method counts
        if (sale.paymentMedium === "Tiền mặt") {
          summary.cashOrders += 1;
        } else {
          summary.transferOrders += 1;
        }

        // Update ticket breakdown
        if (!summary.ticketBreakdown[sale.buyerTicketType]) {
          summary.ticketBreakdown[sale.buyerTicketType] = 0;
        }
        summary.ticketBreakdown[sale.buyerTicketType] += 1;

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
                variant={isToday ? "default" : "outline"}
                onClick={setToday}
                size="sm"
                className={isToday ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                Hôm nay
              </Button>
              <Button
                variant={isThisWeek ? "default" : "outline"}
                onClick={setThisWeek}
                size="sm"
                className={isThisWeek ? "bg-green-600 hover:bg-green-700" : ""}
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
                <div className="text-2xl font-bold text-blue-600">
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
                      %
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium mb-1">Hình thức thanh toán:</p>
                      <p>• Tiền mặt: {day.cashOrders} đơn</p>
                      <p>• Chuyển khoản: {day.transferOrders} đơn</p>
                    </div>

                    <div>
                      <p className="font-medium mb-1">Loại vé bán chạy:</p>
                      {Object.entries(day.ticketBreakdown)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 3)
                        .map(([ticket, count]) => (
                          <p key={ticket}>
                            • {ticket}: {count} vé
                          </p>
                        ))}
                    </div>
                  </div>

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
              Không có dữ liệu bán hàng trong khoảng thời gian đã chọn
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SalesSummary;
