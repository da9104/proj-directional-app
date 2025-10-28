"use client";

import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
  CardTitle,
  CardDescription,
} from "./ui/card";

import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import useSWR from "swr";

interface CoffeeItem {
  brand: string;
  popularity: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CoffeeCharts() {
  const { data, error, isLoading } = useSWR(
    "/api/mock/top-coffee-brands",
    fetcher
  );

  console.log("SWR data:", data);
  console.log("SWR error:", error);
  console.log("SWR isLoading:", isLoading);

  if (isLoading) return <div>로딩…</div>;
  if (error) return <div>에러 발생</div>;
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.log("Data check failed - data:", data);
    return <div>데이터 없음</div>;
  }

  const colors = [
    "#f59e42", // orange-400
    "#60a5fa", // blue-400
    "#34d399", // green-400
    "#f472b6", // pink-400
    "#fde68a", // yellow-400
  ];

  const chartData = data.map((item: CoffeeItem, index: number) => ({
    brand: item.brand,
    popularity: item.popularity,
    fill: colors[index % colors.length],
  }));

  const chartConfig = {
    popularity: {
      label: "인기도",
    },
    ...Object.fromEntries(
      data.map((item: CoffeeItem, index: number) => [
        item.brand,
        {
          label: item.brand,
          color: colors[index % colors.length],
        },
      ])
    ),
  } satisfies ChartConfig;

  return (
    <div className="grid md:grid-cols-2 grid-cols-1 grid-rows-1 gap-4">
      <div className="col-span-1 row-span-1">
        <Card>
          <CardHeader>
            <CardTitle>바 차트: 인기 커피 브랜드</CardTitle>
            <CardDescription>January - June 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="brand"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={false}
                  defaultIndex={1}
                />
                {/* <ChartLegend content={<ChartLegendContent />} /> */}
                <Bar dataKey="popularity" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm"></CardFooter>
        </Card>
      </div>

      <div className="col-span-1 row-span-1">
        <Card className="flex flex-col h-full">
          <CardHeader className="items-center pb-0">
            <CardTitle>도넛 차트: 인기 커피 브랜드</CardTitle>
            <CardDescription>January - June 2024</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square md:h-[350px] h-fit"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="popularity"
                  nameKey="brand"
                  innerRadius={40}
                />
                <ChartLegend
                  content={<ChartLegendContent nameKey="brand" />}
                  className="flex-wrap gap-2 *:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm"></CardFooter>
        </Card>
      </div>
    </div>
  );
}
