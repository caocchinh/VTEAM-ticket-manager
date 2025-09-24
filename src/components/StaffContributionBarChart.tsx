import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { OfflineSalesInfo } from "@/constants/types";

const StaffContributionBarChart = ({
  salesInfo,
}: {
  salesInfo: OfflineSalesInfo[] | undefined;
}) => {
  const chartData = useMemo(() => {
    if (!salesInfo || salesInfo.length === 0) return [];

    const gradeDistribution: Record<string, number> = {};

    salesInfo.forEach((sale) => {
      gradeDistribution[sale.staffName] =
        (gradeDistribution[sale.staffName] || 0) + 1;
    });

    // Convert to chart format and sort by grade
    return Object.entries(gradeDistribution).map(([staffName, count]) => {
      // Sanitize staff name for CSS variable name (remove spaces and special chars)
      const sanitizedStaffName = staffName
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9-_]/g, "");
      return {
        staffName: sanitizedStaffName,
        originalStaffName: staffName,
        "Số lượng vé bán": count,
        fill: `var(--color-${sanitizedStaffName})`,
      };
    });
  }, [salesInfo]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};

    chartData.forEach((item, index) => {
      const colorIndex = (index % 5) + 1;
      config[item.staffName] = {
        label: item.originalStaffName,
        color: `var(--chart-${colorIndex})`,
      };
    });

    return config;
  }, [chartData]) satisfies ChartConfig;

  return (
    <div className=" w-[90%] md:w-[500px] h-max !p-2">
      <div className="pb-3 flex items-center justify-center flex-col">
        <h3 className="text-lg text-center font-semibold">Staff</h3>
        <p className="text-sm text-center">
          Có {chartData.length} staff điền form
        </p>
      </div>
      <div className="pt-0 w-full">
        <ChartContainer config={chartConfig} className=" w-full ">
          <BarChart data={chartData} maxBarSize={40}>
            <CartesianGrid
              strokeDasharray="2 2"
              className="stroke-muted-foreground/10"
            />
            <XAxis
              dataKey="originalStaffName"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              className="text-xs"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              tickFormatter={(value) => `${value}`}
              className="text-xs"
            />
            <ChartTooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="Số lượng vé bán"
              radius={[6, 6, 0, 0]}
              strokeWidth={1}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default StaffContributionBarChart;
