"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
  CardTitle,
  CardDescription,
} from "./ui/card";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import useSWR from "swr";

interface SeriesItem {
  date: string;
  cups: number;
  bugs: number;
  productivity: number;
}

interface TeamData {
  team: string;
  series: SeriesItem[];
}

interface ApiResponse {
  teams: TeamData[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Custom square dot for productivity lines
const SquareDot = (props: any) => {
  const { cx, cy, stroke, fill } = props;
  const size = 8;
  return (
    <rect
      x={cx - size / 2}
      y={cy - size / 2}
      width={size}
      height={size}
      stroke={stroke}
      strokeWidth={2}
      fill={fill || "white"}
    />
  );
};

export default function CoffeeConsumptionCharts() {
  const { data, error, isLoading } = useSWR<ApiResponse>(
    "/api/mock/coffee-consumption",
    fetcher
  );

  console.log("SWR data:", data);
  console.log("SWR error:", error);
  console.log("SWR isLoading:", isLoading);

  if (isLoading) return <div>Loading…</div>;
  if (error) return <div>Error</div>;
  if (
    !data ||
    !data.teams ||
    !Array.isArray(data.teams) ||
    data.teams.length === 0
  ) {
    console.log("Data check failed - data:", data);
    return <div>No data</div>;
  }

  const teamColors: Record<string, string> = {
    Frontend: "#8b5cf6",
    Backend: "#3b82f6",
    AI: "#ec4899",
  };

  // Group data by cups to have all teams' data at each cup level
  const cupsSet = new Set<number>();
  data.teams.forEach((team) => {
    team.series.forEach((item) => cupsSet.add(item.cups));
  });

  const chartData = Array.from(cupsSet)
    .sort((a, b) => a - b)
    .map((cups) => {
      const dataPoint: any = { cups };
      data.teams.forEach((team) => {
        const item = team.series.find((s) => s.cups === cups);
        if (item) {
          dataPoint[`${team.team}_bugs`] = item.bugs;
          dataPoint[`${team.team}_productivity`] = item.productivity;
        }
      });
      return dataPoint;
    });

  // Build chart config dynamically for each team
  const chartConfig: ChartConfig = {
    cups: {
      label: "Cups",
      color: "#eee",
    },
  };

  data.teams.forEach((team) => {
    chartConfig[`${team.team}_bugs`] = {
      label: `${team.team} Bugs`,
      color: teamColors[team.team] || "#888",
    };
    chartConfig[`${team.team}_productivity`] = {
      label: `${team.team} Productivity`,
      color: teamColors[team.team] || "#888",
    };
  });

  return (
    <div className="">
      <div className="col-span-1 row-span-1">
        <h2 className="mb-2"></h2>
        <Card>
          <CardHeader>
            <CardTitle>Coffee vs Bugs & Productivity</CardTitle>
            <CardDescription>
              Relationship between coffee consumption and team metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 40,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="cups"
                  label={{
                    value: "Coffee Cups",
                    position: "insideBottom",
                    offset: -5,
                  }}
                  tickLine={false}
                  axisLine={true}
                />
                <YAxis
                  yAxisId="left"
                  label={{ value: "Bugs", angle: -90, position: "insideLeft" }}
                  tickLine={false}
                  axisLine={true}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{
                    value: "Productivity",
                    angle: 90,
                    position: "insideRight",
                  }}
                  tickLine={false}
                  axisLine={true}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => `${value} cups`}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                {data.teams.map((team) => (
                  <React.Fragment key={team.team}>
                    <Line
                      yAxisId="left"
                      dataKey={`${team.team}_bugs`}
                      type="monotone"
                      stroke={teamColors[team.team] || "#888"}
                      strokeWidth={2}
                      dot={{ r: 5, strokeWidth: 2 }}
                      name={`${team.team} Bugs`}
                    />
                    <Line
                      yAxisId="right"
                      dataKey={`${team.team}_productivity`}
                      type="monotone"
                      stroke={teamColors[team.team] || "#888"}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={<SquareDot />}
                      name={`${team.team} Productivity`}
                    />
                  </React.Fragment>
                ))}
              </LineChart>
            </ChartContainer>
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>
    </div>
  );
}
