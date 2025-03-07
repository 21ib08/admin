"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import { useState } from "react";
import { FileSpreadsheet, FileDown } from "lucide-react";

// Define your data types
type RoomPriceData = {
  name: string;
  "Standardní pokoj": number;
  "Deluxe pokoj": number;
  Suite: number;
};

// Updated data with 3 room types and realistic numbers
const bookingTrendsData = [
  { name: "Led", bookings: 145, revenue: 487500 },
  { name: "Úno", bookings: 128, revenue: 425000 },
  { name: "Bře", bookings: 167, revenue: 558000 },
  { name: "Dub", bookings: 182, revenue: 623000 },
  { name: "Kvě", bookings: 196, revenue: 680000 },
  { name: "Čvn", bookings: 215, revenue: 752500 },
];

const roomTypeData = [
  { name: "Standardní pokoj", total: 425000, price: 2500 },
  { name: "Deluxe pokoj", total: 558000, price: 3500 },
  { name: "Suite", total: 680000, price: 4500 },
];

const occupancyData = [
  { name: "Led", "Pracovní dny": 55, Víkendy: 85 },
  { name: "Úno", "Pracovní dny": 62, Víkendy: 92 },
  { name: "Bře", "Pracovní dny": 68, Víkendy: 88 },
  { name: "Dub", "Pracovní dny": 75, Víkendy: 95 },
  { name: "Kvě", "Pracovní dny": 72, Víkendy: 98 },
  { name: "Čvn", "Pracovní dny": 78, Víkendy: 96 },
];

// Make sure all your data is properly typed
const roomPriceData: RoomPriceData[] = [
  {
    name: "Led",
    "Standardní pokoj": 2300,
    "Deluxe pokoj": 3200,
    Suite: 4200,
  },
  {
    name: "Úno",
    "Standardní pokoj": 2400,
    "Deluxe pokoj": 3300,
    Suite: 4300,
  },
  {
    name: "Bře",
    "Standardní pokoj": 2600,
    "Deluxe pokoj": 3500,
    Suite: 4500,
  },
  {
    name: "Dub",
    "Standardní pokoj": 2800,
    "Deluxe pokoj": 3800,
    Suite: 4800,
  },
  {
    name: "Kvě",
    "Standardní pokoj": 2900,
    "Deluxe pokoj": 3900,
    Suite: 4900,
  },
  {
    name: "Čvn",
    "Standardní pokoj": 3000,
    "Deluxe pokoj": 4000,
    Suite: 5000,
  },
];

// Add custom tooltip formatter
const formatValue = (value: number) => {
  return value > 1000
    ? `${value.toLocaleString()} Kč`
    : `${value}${typeof value === "number" && value <= 100 ? "%" : ""}`;
};

// Add this theme configuration object
const chartTheme = {
  background: "hsl(var(--background))",
  text: "hsl(var(--foreground))",
  border: "hsl(var(--border))",
  muted: "hsl(var(--muted))",
};

const exportDashboardData = () => {
  // Prepare data from all our charts
  const allData = {
    bookings: bookingTrendsData.map((item) => ({
      month: item.name,
      bookings: item.bookings,
      revenue: item.revenue,
    })),
    roomTypes: roomTypeData.map((item) => ({
      type: item.name,
      revenue: item.total,
      price: item.price,
    })),
    occupancy: occupancyData.map((item) => ({
      month: item.name,
      weekday: item["Pracovní dny"],
      weekend: item.Víkendy,
    })),
    prices: roomPriceData.map((item) => ({
      month: item.name,
      standard: item["Standardní pokoj"],
      deluxe: item["Deluxe pokoj"],
      suite: item.Suite,
    })),
  };

  // Create CSV content for each dataset
  const bookingsCSV = [
    "Měsíc,Počet rezervací,Tržby",
    ...allData.bookings.map(
      (row) => `${row.month},${row.bookings},${row.revenue}`
    ),
  ].join("\n");

  const roomTypesCSV = [
    "Typ pokoje,Tržby,Cena",
    ...allData.roomTypes.map(
      (row) => `${row.type},${row.revenue},${row.price}`
    ),
  ].join("\n");

  const occupancyCSV = [
    "Měsíc,Pracovní dny (%),Víkendy (%)",
    ...allData.occupancy.map(
      (row) => `${row.month},${row.weekday},${row.weekend}`
    ),
  ].join("\n");

  const pricesCSV = [
    "Měsíc,Standardní pokoj,Deluxe pokoj,Suite",
    ...allData.prices.map(
      (row) => `${row.month},${row.standard},${row.deluxe},${row.suite}`
    ),
  ].join("\n");

  // Combine all data with headers
  const fullCSV = [
    "### PŘEHLED REZERVACÍ ###",
    bookingsCSV,
    "\n### TRŽBY PODLE TYPU POKOJE ###",
    roomTypesCSV,
    "\n### OBSAZENOST ###",
    occupancyCSV,
    "\n### VÝVOJ CEN ###",
    pricesCSV,
  ].join("\n\n");

  // Create and trigger download
  const blob = new Blob([fullCSV], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = `hotel-dashboard-${
    new Date().toISOString().split("T")[0]
  }.csv`;
  link.click();
};

export default function DashboardPage() {
  const [isExporting, setIsExporting] = useState(false);

  // Move exportToExcel inside the component and use the state
  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const bookingsData = [
        ["Měsíc", "Počet rezervací", "Tržby (Kč)"],
        ...bookingTrendsData.map((item) => [
          item.name,
          item.bookings,
          item.revenue,
        ]),
      ];

      const roomTypesData = [
        ["Typ pokoje", "Tržby (Kč)", "Cena za noc (Kč)"],
        ...roomTypeData.map((item) => [item.name, item.total, item.price]),
      ];

      const occupancySheetData = [
        ["Měsíc", "Pracovní dny (%)", "Víkendy (%)"],
        ...occupancyData.map((item) => [
          item.name,
          item["Pracovní dny"],
          item.Víkendy,
        ]),
      ];

      const pricesData = [
        ["Měsíc", "Standardní pokoj (Kč)", "Deluxe pokoj (Kč)", "Suite (Kč)"],
        ...roomPriceData.map((item) => [
          item.name,
          item["Standardní pokoj"],
          item["Deluxe pokoj"],
          item.Suite,
        ]),
      ];

      const workbook = XLSX.utils.book_new();

      const bookingsSheet = XLSX.utils.aoa_to_sheet(bookingsData);
      const roomTypesSheet = XLSX.utils.aoa_to_sheet(roomTypesData);
      const occupancySheet = XLSX.utils.aoa_to_sheet(occupancySheetData);
      const pricesSheet = XLSX.utils.aoa_to_sheet(pricesData);

      XLSX.utils.book_append_sheet(
        workbook,
        bookingsSheet,
        "Přehled rezervací"
      );
      XLSX.utils.book_append_sheet(
        workbook,
        roomTypesSheet,
        "Tržby podle pokojů"
      );
      XLSX.utils.book_append_sheet(workbook, occupancySheet, "Obsazenost");
      XLSX.utils.book_append_sheet(workbook, pricesSheet, "Vývoj cen");

      await new Promise((resolve) => setTimeout(resolve, 500));

      XLSX.writeFile(
        workbook,
        `hotel-statistiky-${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const currentStats = {
    totalBookings: 1033,
    bookingsChange: "+12.5",
    occupancy: 78,
    occupancyChange: "+5.2",
    avgPrice: 3500,
    priceChange: "+150",
    revenue: 3525500,
    revenueChange: "+15.8",
  };

  return (
    <div>
      <div className="flex justify-between items-center bg-card rounded-lg p-4 shadow-sm">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Přehled apartmánu
          </h2>
          <p className="text-muted-foreground mt-1">
            Statistiky apartmánu za posledních 6 měsíců
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportDashboardData}
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            <span>CSV</span>
          </button>
          <button
            onClick={exportToExcel}
            disabled={isExporting}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-md
              text-sm font-medium transition-colors
              ${
                isExporting
                  ? "bg-green-100 text-green-800 cursor-wait"
                  : "bg-green-600 text-white hover:bg-green-700"
              }
              shadow-sm
            `}
          >
            {isExporting ? (
              <>
                <div className="h-4 w-4 border-2 border-green-800 border-t-transparent rounded-full animate-spin" />
                <span>Exportuji...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4" />
                <span>Excel</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Celkové rezervace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentStats.totalBookings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentStats.bookingsChange}% oproti minulému období
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Průměrná obsazenost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.occupancy}%</div>
            <p className="text-xs text-muted-foreground">
              {currentStats.occupancyChange}% oproti minulému období
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Průměrná cena za noc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentStats.avgPrice.toLocaleString()} Kč
            </div>
            <p className="text-xs text-muted-foreground">
              +{currentStats.priceChange} Kč oproti minulému období
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Celkové tržby</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentStats.revenue.toLocaleString()} Kč
            </div>
            <p className="text-xs text-muted-foreground">
              {currentStats.revenueChange}% oproti minulému období
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              Vývoj rezervací a tržeb
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingTrendsData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartTheme.muted}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke={chartTheme.text}
                  tick={{ fill: chartTheme.text }}
                />
                <YAxis
                  yAxisId="left"
                  stroke={chartTheme.text}
                  tick={{ fill: chartTheme.text }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke={chartTheme.text}
                  tick={{ fill: chartTheme.text }}
                />
                <Tooltip
                  formatter={formatValue}
                  contentStyle={{
                    backgroundColor: chartTheme.background,
                    borderColor: chartTheme.border,
                    color: chartTheme.text,
                  }}
                  labelStyle={{ color: chartTheme.text }}
                />
                <Legend wrapperStyle={{ color: chartTheme.text }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="bookings"
                  stroke="hsl(var(--chart-1))"
                  name="Počet rezervací"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--chart-2))"
                  name="Tržby (Kč)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              Tržby podle typu pokoje
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomTypeData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartTheme.muted}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke={chartTheme.text}
                  tick={{ fill: chartTheme.text }}
                />
                <YAxis
                  stroke={chartTheme.text}
                  tick={{ fill: chartTheme.text }}
                />
                <Tooltip
                  formatter={(value) => `${Number(value).toLocaleString()} Kč`}
                  contentStyle={{
                    backgroundColor: chartTheme.background,
                    borderColor: chartTheme.border,
                    color: chartTheme.text,
                  }}
                  itemStyle={{ color: chartTheme.text }}
                  labelStyle={{ color: chartTheme.text }}
                  cursor={{ fill: "hsl(var(--muted))" }}
                />
                <Bar dataKey="total" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              Obsazenost - pracovní dny vs. víkendy
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartTheme.muted}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke={chartTheme.text}
                  tick={{ fill: chartTheme.text }}
                />
                <YAxis
                  stroke={chartTheme.text}
                  tick={{ fill: chartTheme.text }}
                />
                <Tooltip
                  formatter={(value) => `${value}%`}
                  contentStyle={{
                    backgroundColor: chartTheme.background,
                    borderColor: chartTheme.border,
                    color: chartTheme.text,
                  }}
                  itemStyle={{ color: chartTheme.text }}
                  labelStyle={{ color: chartTheme.text }}
                  cursor={{ fill: "hsl(var(--muted))" }}
                />
                <Legend wrapperStyle={{ color: chartTheme.text }} />
                <Bar dataKey="Pracovní dny" fill="hsl(var(--chart-1))" />
                <Bar dataKey="Víkendy" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              Vývoj cen pokojů
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={roomPriceData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartTheme.muted}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke={chartTheme.text}
                  tick={{ fill: chartTheme.text }}
                />
                <YAxis
                  stroke={chartTheme.text}
                  tick={{ fill: chartTheme.text }}
                />
                <Tooltip
                  formatter={(value) => `${value} Kč`}
                  contentStyle={{
                    backgroundColor: chartTheme.background,
                    borderColor: chartTheme.border,
                    color: chartTheme.text,
                  }}
                  labelStyle={{ color: chartTheme.text }}
                />
                <Legend wrapperStyle={{ color: chartTheme.text }} />
                <Line
                  type="monotone"
                  dataKey="Standardní pokoj"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="Deluxe pokoj"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="Suite"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
