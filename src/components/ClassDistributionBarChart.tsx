import { SalesInfo } from "@/constants/types";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ClassDistributionBarChart = ({
  salesInfo,
}: {
  salesInfo: SalesInfo[] | undefined;
}) => {
  const chartData = useMemo(() => {
    if (!salesInfo || salesInfo.length === 0) return [];

    // Extract grade from class (e.g., "12B3" -> 12, "6A3" -> 6)
    const gradeDistribution: Record<number, number> = {};

    salesInfo.forEach((sale) => {
      const classMatch = sale.buyerClass.match(/^(\d+)/);
      if (classMatch) {
        const grade = parseInt(classMatch[1]);
        gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
      }
    });

    // Convert to chart format and sort by grade
    return Object.entries(gradeDistribution)
      .map(([grade, count]) => ({
        grade: `Lớp ${grade}`,
        gradeNumber: parseInt(grade),
        "Học sinh": count,
        fill: `var(--color-grade${grade})`,
      }))
      .sort((a, b) => a.gradeNumber - b.gradeNumber);
  }, [salesInfo]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};

    chartData.forEach((item, index) => {
      const colorIndex = (index % 5) + 1; // Rotate colors 1-5
      const gradeKey = `grade${item.gradeNumber}`;
      config[gradeKey] = {
        label: item.grade,
        color: `var(--chart-${colorIndex})`,
      };
    });

    return config;
  }, [chartData]) satisfies ChartConfig;

  const totalStudents = chartData.reduce(
    (sum, item) => sum + item["Học sinh"],
    0
  );

  if (!salesInfo || salesInfo.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Phân phối lớp</CardTitle>
          <CardDescription>Không có dữ kiện để tạo biểu đồ!</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 flex items-center justify-center flex-col">
        <CardTitle className="text-lg text-center">Phân phối lớp</CardTitle>
        <CardDescription className="text-sm text-center">
          {totalStudents} học sinh • {chartData.length} khối lớp
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 w-full">
        <ChartContainer config={chartConfig} className=" w-full">
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 20,
              left: 15,
              bottom: chartData.length > 8 ? 40 : 15,
            }}
            maxBarSize={40}
          >
            <CartesianGrid
              strokeDasharray="2 2"
              className="stroke-muted-foreground/10"
            />
            <XAxis
              dataKey="grade"
              tickLine={false}
              tickMargin={6}
              axisLine={false}
              className="text-xs"
              angle={chartData.length > 8 ? -45 : 0}
              textAnchor={chartData.length > 8 ? "end" : "middle"}
              height={chartData.length > 8 ? 40 : 25}
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
            <Bar dataKey="Học sinh" radius={[6, 6, 0, 0]} strokeWidth={1} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ClassDistributionBarChart;
