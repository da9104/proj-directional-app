"use client";

import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
  CardTitle,
  CardDescription,
} from "./ui/card";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import useSWR from "swr";

interface MoodItem {
  week: Date;
  happy: number;
  tired: number;
  stressed: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MoodTrendCharts() {
  const { data, error, isLoading } = useSWR(
    "/api/mock/weekly-mood-trend",
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

  const moodColors = {
    happy: "#cdb4db", 
    tired: "#ffc8dd", 
    stressed: "#ffafcc",
  };


  const chartData = data.map((item: MoodItem) => ({
    week: item.week,
    happy: item.happy,
    tired: item.tired,
    stressed: item.stressed,
  }));

  const chartConfig = {
    happy: {
      label: "Happy",
      color: moodColors.happy,
    },
    tired: {
      label: "Tired",
      color: moodColors.tired,
    },
    stressed: {
      label: "Stressed",
      color: moodColors.stressed,
    },
  } satisfies ChartConfig;

  return (
    <div className="">
      <div className="col-span-1 row-span-1">
        <h2 className="mb-2"></h2>
        <Card>
          <CardHeader>
            <CardTitle>바 차트: 무드 트랜드 </CardTitle>
            <CardDescription>January - June 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="week"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={false}
                  defaultIndex={1}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="happy"
                  stackId="a"
                  fill={moodColors.happy}
                  radius={[0, 0, 4, 4]}
                />
                <Bar
                  dataKey="tired"
                  stackId="a"
                  fill={moodColors.tired}
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="stressed"
                  stackId="a"
                  fill={moodColors.stressed}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm"></CardFooter>
        </Card>
      </div>
    </div>
  );
}
