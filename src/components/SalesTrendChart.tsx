"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { SalesInfo, TicketInfo } from "@/constants/types";
import { formatVietnameseCurrency, parseVietnameseCurrency } from "@/lib/utils";
import { useMemo } from "react";
import { format, parse } from "date-fns";
import { vi } from "date-fns/locale";

interface SalesTrendChartProps {
  salesInfo: SalesInfo[];
  ticketInfo: TicketInfo[];
  staffName?: string;
}

interface ChartDataPoint {
  date: string;
  displayDate: string;
  totalRevenue: number;
  totalOrders: number;
  staffRevenue: number;
  staffOrders: number;
}

const chartConfig = {
  totalRevenue: {
    label: "Tổng doanh thu",
    color: "var(--chart-1)",
  },
  totalOrders: {
    label: "Tổng đơn hàng",
    color: "var(--chart-2)",
  },
  staffRevenue: {
    label: "Doanh thu của bạn",
    color: "var(--chart-3)",
  },
  staffOrders: {
    label: "Đơn hàng của bạn",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const SalesTrendChart = ({
  salesInfo,
  ticketInfo,
  staffName,
}: SalesTrendChartProps) => {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("totalRevenue");

  const chartData = useMemo(() => {
    if (!salesInfo || !ticketInfo) return [];

    // Group sales by date
    const dailyData: Record<string, ChartDataPoint> = {};

    salesInfo.forEach((sale) => {
      try {
        const saleDate = parse(sale.time, "dd/MM/yyyy HH:mm:ss", new Date());
        const dateKey = format(saleDate, "yyyy-MM-dd");
        const displayDate = format(saleDate, "dd/MM", { locale: vi });

        if (!dailyData[dateKey]) {
          dailyData[dateKey] = {
            date: dateKey,
            displayDate,
            totalRevenue: 0,
            totalOrders: 0,
            staffRevenue: 0,
            staffOrders: 0,
          };
        }

        const ticketPrice =
          ticketInfo.find((info) => sale.buyerTicketType === info.ticketName)
            ?.price ?? 0;
        const numericPrice = parseVietnameseCurrency(ticketPrice);

        // Update totals
        dailyData[dateKey].totalRevenue += numericPrice;
        dailyData[dateKey].totalOrders += 1;

        // Update staff data if this sale belongs to the current staff
        if (staffName && sale.staffName === staffName) {
          dailyData[dateKey].staffRevenue += numericPrice;
          dailyData[dateKey].staffOrders += 1;
        }
      } catch (error) {
        console.error("Error processing sale for chart:", error);
      }
    });

    return Object.values(dailyData).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [salesInfo, ticketInfo, staffName]);

  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, curr) => ({
        totalRevenue: acc.totalRevenue + curr.totalRevenue,
        totalOrders: acc.totalOrders + curr.totalOrders,
        staffRevenue: acc.staffRevenue + curr.staffRevenue,
        staffOrders: acc.staffOrders + curr.staffOrders,
      }),
      { totalRevenue: 0, totalOrders: 0, staffRevenue: 0, staffOrders: 0 }
    );
  }, [chartData]);

  const formatValue = (value: number, key: keyof typeof chartConfig) => {
    if (key.includes("Revenue")) {
      return formatVietnameseCurrency(value);
    }
    return value.toLocaleString();
  };

  const getYAxisDomain = () => {
    if (!chartData.length) return [0, 100];

    const values = chartData.map((d) => d[activeChart]);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    // Add some padding
    const padding = (maxValue - minValue) * 0.1;
    return [Math.max(0, minValue - padding), maxValue + padding];
  };

  if (!chartData.length) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            Không có đủ dữ liệu để hiển thị biểu đồ xu hướng
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>Xu hướng bán hàng</CardTitle>
          <CardDescription>
            Biểu đồ thể hiện xu hướng doanh thu và đơn hàng theo thời gian
          </CardDescription>
        </div>
        <div className="flex w-[65%]">
          {(Object.keys(chartConfig) as Array<keyof typeof chartConfig>).map(
            (key) => {
              // Only show staff data if staffName is provided
              if (key.includes("staff") && !staffName) return null;

              return (
                <button
                  key={key}
                  data-active={activeChart === key}
                  className="data-[active=true]:bg-[#0084ff] data-[active=true]:text-white cursor-pointer flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                  onClick={() => setActiveChart(key)}
                >
                  <span className="text-xs">{chartConfig[key].label}</span>
                  <span className="text-sm leading-none font-bold ">
                    {formatValue(totals[key], key)}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] sm:h-[300px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={getYAxisDomain()}
              tickFormatter={(value) => {
                if (activeChart.includes("Revenue")) {
                  return formatVietnameseCurrency(value);
                }
                return value.toLocaleString();
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[200px]"
                  labelFormatter={(value, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload as ChartDataPoint;
                      return format(new Date(data.date), "EEEE, dd/MM/yyyy", {
                        locale: vi,
                      });
                    }
                    return value;
                  }}
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={`var(--color-${activeChart})`}
              strokeWidth={3}
              dot={{
                fill: `var(--color-${activeChart})`,
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SalesTrendChart;
