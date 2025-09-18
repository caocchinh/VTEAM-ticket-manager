"use client";

import { LabelList, Pie, PieChart } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { SalesInfo } from "@/constants/types";
import { useMemo } from "react";

export default function PaymentDistributionPieChart({
  salesInfo,
}: {
  salesInfo: SalesInfo[] | undefined;
}) {
  const chartData = useMemo(() => {
    if (!salesInfo || salesInfo.length === 0) return [];

    const mediumDistribution: Record<string, number> = {};

    salesInfo.forEach((sale) => {
      mediumDistribution[sale.paymentMedium] =
        (mediumDistribution[sale.paymentMedium] || 0) + 1;
    });

    const total = salesInfo.length;

    // Convert to chart format and sort by grade
    return Object.entries(mediumDistribution).map(([medium, count]) => {
      // Remove parentheses and their contents from ticket type
      const percentage = ((count / total) * 100).toFixed(1);
      // Sanitize medium for CSS variable name (remove spaces and special chars)
      const sanitizedMedium = medium
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9-_]/g, "");
      return {
        medium: sanitizedMedium,
        originalMedium: medium,
        "Số lượng": count,
        percentage: parseFloat(percentage),
        fill: `var(--color-${sanitizedMedium})`,
      };
    });
  }, [salesInfo]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};

    chartData.forEach((item, index) => {
      const colorIndex = (index % 5) + 1;
      config[item.medium] = {
        label: item.originalMedium,
        color: `var(--chart-${colorIndex})`,
      };
    });

    return config;
  }, [chartData]) satisfies ChartConfig;

  return (
    <Card className="flex flex-col w-[50%] h-max">
      <CardHeader className="items-center pb-0 flex justify-center flex-col">
        <CardTitle className="text-lg -mb-10">Hình thức</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="Số lượng"
              nameKey="medium"
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
              content={<ChartLegendContent nameKey="medium" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
