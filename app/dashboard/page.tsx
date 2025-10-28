import CoffeeCharts from "@/components/coffee-chart";
import MoodTrendCharts from "@/components/mood-trend-chart";
import CoffeeConsumptionCharts from "@/components/coffee-consumption-chart";

export const DashboardPage = () => {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8 w-full">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Chart Analytics
          </h1>
        </div>
        <CoffeeCharts />
        <div className="grid grid-cols-2 grid-rows-1 gap-4">
          <MoodTrendCharts />
          <CoffeeConsumptionCharts />
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
