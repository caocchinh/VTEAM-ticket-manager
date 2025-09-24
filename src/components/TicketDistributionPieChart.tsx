"use client";

import { LabelList, Pie, PieChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMemo } from "react";
import { OfflineSalesInfo, OnlineSalesInfo } from "@/constants/types";

export default function TicketDistributionPieChart({
  salesInfo,
}: {
  salesInfo: OfflineSalesInfo[] | OnlineSalesInfo[] | undefined;
}) {
  const chartData = useMemo(() => {
    if (!salesInfo || salesInfo.length === 0) return [];

    const ticketDistribution: Record<string, number> = {};

    salesInfo.forEach((sale) => {
      ticketDistribution[sale.buyerTicketType] =
        (ticketDistribution[sale.buyerTicketType] || 0) + 1;
    });

    const total = salesInfo.length;

    // Convert to chart format and sort by grade
    return Object.entries(ticketDistribution).map(([ticketType, count]) => {
      // Remove parentheses and their contents from ticket type
      const cleanTicketType = ticketType.replace(/\s*\([^)]*\)/g, "").trim();
      // Sanitize ticket type for CSS variable name (remove spaces and special chars)
      const sanitizedTicketType = cleanTicketType
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9-_]/g, "");
      const percentage = ((count / total) * 100).toFixed(1);
      return {
        ticketType: sanitizedTicketType,
        originalTicketType: cleanTicketType,
        "Số lượng": count,
        percentage: parseFloat(percentage),
        fill: `var(--color-${sanitizedTicketType})`,
      };
    });
  }, [salesInfo]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};

    chartData.forEach((item, index) => {
      const colorIndex = (index % 5) + 1;
      config[item.ticketType] = {
        label: item.originalTicketType,
        color: `var(--chart-${colorIndex})`,
      };
    });

    return config;
  }, [chartData]) satisfies ChartConfig;

  return (
    <div className="flex flex-col  w-[90%] md:w-[500px] h-max !p-2">
      <div className="items-center pb-0 flex justify-center flex-col">
        <h3 className="text-lg text-center font-semibold">Phân khối vé</h3>
        <p className="text-sm text-center">{chartData.length} khối vé</p>
      </div>
      <div className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="Số lượng"
              nameKey="ticketType"
              animationDuration={900}
              animationBegin={0}
            >
              <LabelList
                dataKey="percentage"
                fontSize={12}
                formatter={(value: number) => (value >= 5 ? `${value}%` : "")}
                position="inside"
              />
            </Pie>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <ChartLegend
              content={<ChartLegendContent nameKey="ticketType" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </div>
    </div>
  );
}
