import { SalesInfo } from "@/constants/types";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

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

  return (
    <div className="  w-[90%] md:w-[500px] h-max !p-2">
      <div className="pb-3 flex items-center justify-center flex-col">
        <h3 className="text-lg text-center font-semibold">Phân khối lớp</h3>
        <p className="text-sm text-center">{chartData.length} khối lớp</p>
      </div>
      <div className="pt-0 w-full">
        <ChartContainer config={chartConfig} className=" w-full ">
          <BarChart
            data={chartData}
            maxBarSize={40}
            layout="vertical"
            margin={{
              left: 60,
              right: 16,
              top: 8,
              bottom: 8,
            }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis
              dataKey="Học sinh"
              type="number"
              tickLine={false}
              tickMargin={6}
              axisLine={false}
              hide
              className="text-xs"
            />
            <YAxis
              type="category"
              dataKey="grade"
              tickLine={false}
              axisLine={false}
              hide
              tickMargin={6}
              tickFormatter={(value) => `${value}`}
              className="text-xs"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="Học sinh"
              layout="vertical"
              radius={4}
              minPointSize={50}
            >
              <LabelList
                dataKey="grade"
                position="insideLeft"
                offset={8}
                className="fill-white"
                fontSize={12}
              />
              <LabelList
                dataKey="Học sinh"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default ClassDistributionBarChart;
