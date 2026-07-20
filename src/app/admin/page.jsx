"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Wine,
  Utensils,
  Bed,
  PartyPopper,
  Coffee,
  Music,
  Car,
  Gamepad2,
  Gift,
  ShoppingBag,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Brush,
} from "recharts";
import { makeGet } from "@/lib/api";
import SalesFilter from "@/components/SalesFilter";
import Link from "next/link";

const LOCAL_DATE_KEY = "dashboardDateFilters";

const formatDate = (input) => {
  const date = new Date(input);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Compact currency formatter for chart axes: ₹34.7L, ₹4.5Cr
const formatAxisCurrency = (value) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value}`;
};

const AdminPage = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const [selectedPeriod, setSelectedPeriod] = useState("Yesterday");
  const [selectedDate, setSelectedDate] = useState(formatDate(yesterday));
  const [toDate, setToDate] = useState(formatDate(yesterday));
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);

  const [showAllHotels, setShowAllHotels] = useState(false);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [hotelCategories, setHotelCategories] = useState([]);
  const [totalSalesData, setTotalSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [totalSalesSummary, setTotalSalesSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [selectedSalesCategories, setSelectedSalesCategories] = useState([]);

  useEffect(() => {
    const savedDates = localStorage.getItem(LOCAL_DATE_KEY);
    if (savedDates) {
      const { selectedDate, toDate, selectedPeriod } = JSON.parse(savedDates);
      if (selectedDate) setSelectedDate(selectedDate);
      if (toDate) setToDate(toDate);
      if (selectedPeriod) setSelectedPeriod(selectedPeriod);
    }
  }, []);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(debounceTimeout);
  }, [selectedPeriod]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      selectedCities?.forEach((id) => query.append("city_ids[]", id));
      selectedCategories?.forEach((id) => query.append("category_ids[]", id));
      selectedHotels?.forEach((id) => query.append("hotel_ids[]", id));
      selectedSalesCategories?.forEach((id) =>
        query.append("sales_catogory_ids[]", id)
      );

      const data = await makeGet(`/admin/dashboard?${query.toString()}`, {
        start_date: selectedDate,
        end_date: toDate,
      });

      setServiceCategories(data.sales_by_categories);
      setHotelCategories(data.sales_by_hotel);
      setTotalSalesData(data.sales_trend);
      setCategoryData(data.salesByCategoryType);
      setCityData(data.salesByCity);
      setTotalSalesSummary(data.sales_summary);
      setLoading(false);
    } catch (error) {
      console.error("Dashboard fetch error", error);
      setLoading(false);
    }
  };

  const getStartOfWeek = (date) => {
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const start = new Date(date);
    start.setDate(date.getDate() + diff);
    return start;
  };

  const getEndOfWeek = (date) => {
    const start = getStartOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
  };

  const getStartOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1);
  const getEndOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const handlePeriodChange = (period) => {
    let from = new Date();
    let to = new Date();

    switch (period) {
      case "Today":
        from = to = new Date();
        break;
      case "Yesterday":
        from.setDate(from.getDate() - 1);
        to.setDate(to.getDate() - 1);
        break;
      case "Last Yesterday":
        from.setDate(from.getDate() - 2);
        to.setDate(to.getDate() - 2);
        break;
      case "Week":
        from = getStartOfWeek(new Date());
        to = getEndOfWeek(new Date());
        break;
      case "Last Week":
        to = getStartOfWeek(new Date());
        to.setDate(to.getDate() - 1);
        from = getStartOfWeek(to);
        break;
      case "14 Days":
        from.setDate(from.getDate() - 13);
        break;
      case "Month":
        from = getStartOfMonth(new Date());
        to = getEndOfMonth(new Date());
        break;
      case "Last Month":
        const today = new Date();
        const lastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        from = getStartOfMonth(lastMonth);
        to = getEndOfMonth(lastMonth);
        break;
    }

    const formattedFrom = formatDate(from);
    const formattedTo = formatDate(to);

    setSelectedDate(formattedFrom);
    setToDate(formattedTo);
    setSelectedPeriod(period);
    localStorage.setItem(
      LOCAL_DATE_KEY,
      JSON.stringify({
        selectedDate: formattedFrom,
        toDate: formattedTo,
        selectedPeriod: period,
      })
    );
  };

  const formatINRCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const applyDateFilter = () => {
    setIsDateFilterOpen(false);
    localStorage.setItem(
      LOCAL_DATE_KEY,
      JSON.stringify({
        selectedDate,
        toDate,
        selectedPeriod,
      })
    );
    fetchData();
  };

  const COLORS = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
  ];

  const LCOLORS = [
    "#3182CE",
    "#38A169",
    "#D69E2E",
    "#805AD5",
    "#DD6B20",
    "#E53E3E",
    "#319795",
    "#E53E3E",
    "#553C9A",
    "#2B6CB0",
    "#276749",
    "#B7791F",
    "#C53030",
    "#2C5282",
    "#2F855A",
    "#ED8936",
    "#6B46C1",
    "#0987A0",
    "#B83280",
    "#744210",
    "#1A202C",
    "#2A4365",
    "#1A365D",
    "#2D3748",
    "#4A5568",
  ];

  const tformatINRCurrency = (value) =>
    `₹${Number(value).toLocaleString("en-IN")}`;

  const displayedHotels = showAllHotels
    ? hotelCategories
    : hotelCategories.slice(0, 10);

  const handleFilter = async ({
    cities,
    categories,
    hotels,
    salesCategory,
  }) => {
    try {
      setLoading(true);
      const query = new URLSearchParams();

      cities?.forEach((id) => query.append("city_ids[]", id));
      categories?.forEach((id) => query.append("category_ids[]", id));
      hotels?.forEach((id) => query.append("hotel_ids[]", id));
      salesCategory?.forEach((id) =>
        query.append("sales_catogory_ids[]", id)
      );

      setSelectedCities(cities);
      setSelectedCategories(categories);
      setSelectedHotels(hotels);
      setSelectedSalesCategories(salesCategory);

      try {
        const data = await makeGet(`/admin/dashboard?${query.toString()}`, {
          start_date: selectedDate,
          end_date: toDate,
        });
        setServiceCategories(data.sales_by_categories);
        setHotelCategories(data.sales_by_hotel);
        setTotalSalesData(data.sales_trend);
        setCategoryData(data.salesByCategoryType);
        setCityData(data.salesByCity);
        setTotalSalesSummary(data.sales_summary);
        setLoading(false);
      } catch (error) {
        console.error("Dashboard fetch error", error);
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to load sales", err);
    } finally {
      setLoading(false);
    }
  };

  function formatComparedTo(from, to) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yyyy = yesterday.getFullYear();
    const mm = String(yesterday.getMonth() + 1).padStart(2, "0");
    const dd = String(yesterday.getDate()).padStart(2, "0");
    const yesterdayStr = `${yyyy}-${mm}-${dd}`;

    if (from === yesterdayStr && to === yesterdayStr) {
      return "yesterday";
    }
    return `${from} - ${to}`;
  }

  const today = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === today && toDate === today;

  const funnelData = serviceCategories
    .sort((a, b) => b.total - a.total)
    .map((item, index) => ({
      name: item.category_name,
      value: item.total,
      fill: COLORS[index % COLORS.length],
    }));

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-xl border border-slate-200/80">
          <p className="text-[11px] font-semibold text-slate-400 mb-1">
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-bold text-slate-800">
              {formatINRCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Skeleton components
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-3 w-20 bg-slate-200 rounded-full" />
        <div className="h-5 w-14 bg-slate-100 rounded-full" />
      </div>
      <div className="h-8 w-32 bg-slate-200 rounded-lg mt-2" />
      <div className="h-3 w-24 bg-slate-100 rounded-full mt-3" />
    </div>
  );

  const SkeletonChart = () => (
    <div className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
      <div className="h-4 w-36 bg-slate-200 rounded-full mb-6" />
      <div className="h-[220px] bg-slate-50 rounded-xl flex items-end justify-around px-4 pb-4 gap-2">
        {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
          <div
            key={i}
            className="bg-slate-200 rounded-t-md w-full"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );

  // Period button labels (shorter for mobile)
  const periods = [
    { key: "Today", short: "Today" },
    { key: "Yesterday", short: "Yest." },
    { key: "Last Yesterday", short: "D-2" },
    { key: "Week", short: "Week" },
    { key: "Last Week", short: "L.Week" },
    { key: "14 Days", short: "14D" },
    { key: "Month", short: "Month" },
    { key: "Last Month", short: "L.Month" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/80 pb-8 px-1.5 md:px-3">
      {/* ============ FILTER BAR ============ */}
      <div className="bg-white rounded-2xl p-3 md:p-4 mb-4 shadow-sm border border-slate-100/80">
        {/* Period Selector */}
        <div className="flex overflow-x-auto no-scrollbar scrollbar-hide whitespace-nowrap gap-1 md:gap-1.5 pb-2">
          {periods.map((period) => (
            <button
              key={period.key}
              onClick={() => handlePeriodChange(period.key)}
              className={`py-1.5 px-2.5 md:px-3.5 rounded-lg text-[11px] md:text-xs font-bold transition-all duration-200 shrink-0 ${
                selectedPeriod === period.key
                  ? "bg-slate-800 text-white shadow-sm shadow-slate-300/50"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100 active:scale-95"
              }`}
            >
              <span className="md:hidden">{period.short}</span>
              <span className="hidden md:inline">{period.key}</span>
            </button>
          ))}
        </div>

        {/* Date Range + Filters Row */}
        <div className="flex items-center gap-2 mt-2">
          {/* Date Range Selector */}
          <div className="relative flex-1">
            <button
              onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 rounded-xl text-left transition-all font-semibold text-xs text-slate-700 focus:outline-none h-9"
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {selectedDate === toDate
                    ? formatDate(selectedDate)
                    : `${formatDate(selectedDate)} → ${formatDate(toDate)}`}
                </span>
              </div>
              {isDateFilterOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* Dropdown */}
            {isDateFilterOpen && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl p-4 border border-slate-200/80 z-30">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      From
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      To
                    </label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition-all"
                    />
                  </div>
                </div>
                <button
                  onClick={applyDateFilter}
                  className="bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg transition-all w-full font-bold shadow-sm active:scale-[0.98] text-xs"
                >
                  Apply Filter
                </button>
              </div>
            )}
          </div>

          {/* Filter + Options Row */}
          <div className="flex items-center gap-1.5">
            <div className="hidden md:flex items-center gap-3 px-3">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 text-slate-800 bg-gray-50 border-gray-300 rounded focus:ring-slate-500 focus:ring-1 accent-slate-800"
                />
                <span className="text-xs font-semibold text-slate-600">
                  Margin
                </span>
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 text-slate-800 bg-gray-50 border-gray-300 rounded focus:ring-slate-500 focus:ring-1 accent-slate-800"
                />
                <span className="text-xs font-semibold text-slate-600">
                  Expense
                </span>
              </label>
            </div>
            <SalesFilter onApplyFilter={handleFilter} hotel_type={0} />
          </div>
        </div>
      </div>

      {/* ============ LOADING STATE ============ */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SkeletonCard />
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SkeletonChart />
            <SkeletonChart />
          </div>
        </div>
      )}

      {/* ============ MAIN DASHBOARD ============ */}
      {!loading && (
        <div className="space-y-4">
          {/* Section 1: KPI Summary & City Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Period Summary Card */}
            <div className="lg:col-span-1 bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100/80 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xs md:text-sm font-bold text-slate-700 tracking-tight">
                      {isToday ? "Today's" : "Period"} Summary
                    </h3>
                  </div>
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] md:text-xs font-bold ${
                      totalSalesSummary.trend === "up"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {totalSalesSummary.trend === "up" ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{totalSalesSummary.label}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                      Total Revenue
                    </p>
                    <p className="text-2xl md:text-4xl font-extrabold text-slate-900 mt-1 tracking-tight">
                      {formatINRCurrency(totalSalesSummary.amount)}
                    </p>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <span className="text-slate-500 text-[11px] md:text-sm font-semibold">
                      Average / Day
                    </span>
                    <span className="font-bold text-slate-800 text-sm md:text-base">
                      {formatINRCurrency(totalSalesSummary?.average?.value)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[10px] md:text-xs font-medium text-slate-400">
                  vs{" "}
                  {formatComparedTo(
                    totalSalesSummary?.compared_to?.from,
                    totalSalesSummary?.compared_to?.to
                  )}
                </span>
                <span
                  className={`text-base md:text-xl font-extrabold ${
                    totalSalesSummary.trend === "up"
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {totalSalesSummary.change_percent}%
                </span>
              </div>
            </div>

            {/* City Performance Cards */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100/80">
              <h2 className="text-xs md:text-sm font-bold text-slate-700 mb-3.5 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <MapPin className="text-blue-500 w-3.5 h-3.5" />
                </div>
                <span>City Performance</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {cityData.map((city) => (
                  <Link
                    key={city.city}
                    href={`/admin/city?city=${city.city}&from_date=${selectedDate}&to_date=${toDate}`}
                    className="group bg-gradient-to-br from-slate-50/80 to-white rounded-xl p-3.5 md:p-4 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs md:text-sm font-bold text-slate-600 uppercase tracking-wider">
                        {city.city}
                      </h3>
                      <div
                        className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] md:text-[11px] font-bold ${
                          city.trend === "up"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {city.trend === "up" ? (
                          <TrendingUp className="w-2.5 h-2.5" />
                        ) : (
                          <TrendingDown className="w-2.5 h-2.5" />
                        )}
                        <span>{Math.abs(city.change_percent)}%</span>
                      </div>
                    </div>
                    <p className="text-base md:text-xl font-extrabold text-slate-900 leading-tight">
                      {formatINRCurrency(city.total)}
                    </p>
                    <p className="text-[10px] md:text-xs font-medium text-slate-400 mt-1">
                      Prev: {formatINRCurrency(city.previous_total)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sales Trend Chart */}
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100/80">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Activity className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <h3 className="text-xs md:text-sm font-bold text-slate-700 tracking-tight">
                    Sales Trend
                  </h3>
                </div>
                {totalSalesData.length > 14 && (
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                    Drag slider to zoom • {totalSalesData.length} days
                  </span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={totalSalesData.length > 14 ? 310 : 250}>
                <LineChart data={totalSalesData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#94a3b8", fontWeight: 600 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    fontSize={10}
                    domain={[0, "dataMax + 40000"]}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatAxisCurrency}
                    tick={{ fill: "#94a3b8", fontWeight: 600 }}
                    width={55}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#1e293b"
                    strokeWidth={2.5}
                    dot={{ fill: "#1e293b", strokeWidth: 0, r: totalSalesData.length > 30 ? 0 : 3 }}
                    activeDot={{
                      r: 6,
                      fill: "#1e293b",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                  {totalSalesData.length > 14 && (
                    <Brush
                      dataKey="date"
                      height={28}
                      stroke="#cbd5e1"
                      fill="#f8fafc"
                      travellerWidth={10}
                      startIndex={Math.max(0, totalSalesData.length - 14)}
                      endIndex={totalSalesData.length - 1}
                      tickFormatter={(val) => ""}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category Bar Chart */}
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100/80">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <h3 className="text-xs md:text-sm font-bold text-slate-700 tracking-tight">
                  Sales by Category
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData} barCategoryGap="20%">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="category_type_name"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#94a3b8", fontWeight: 600 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={45}
                  />
                  <YAxis
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatAxisCurrency}
                    tick={{ fill: "#94a3b8", fontWeight: 600 }}
                    width={55}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={LCOLORS[index % LCOLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section 3: Hotel Performance & Service Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Hotel Performance */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100/80">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Bed className="w-3.5 h-3.5 text-violet-500" />
                  </div>
                  <h2 className="text-xs md:text-sm font-bold text-slate-700">
                    Hotel Performance
                  </h2>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 font-bold text-slate-400">
                  {hotelCategories.length} hotels
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {displayedHotels.map((hotel, index) => (
                  <Link
                    href={`/admin/hotel?hotel_id=${hotel.hotel_id}&from_date=${selectedDate}&to_date=${toDate}`}
                    key={index}
                    className="group bg-gradient-to-br from-slate-50/80 to-white rounded-xl p-3.5 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-violet-50 group-hover:text-violet-500 transition-colors">
                        <Bed className="w-3.5 h-3.5" />
                      </div>
                      <div
                        className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] md:text-[11px] font-bold ${
                          hotel.trend === "up"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {hotel.trend === "up" ? (
                          <TrendingUp className="w-2.5 h-2.5" />
                        ) : (
                          <TrendingDown className="w-2.5 h-2.5" />
                        )}
                        <span>{hotel?.change_percent}%</span>
                      </div>
                    </div>

                    <h3 className="text-sm md:text-base font-bold text-slate-800 truncate leading-tight">
                      {hotel?.hotel_name}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mt-0.5 mb-2">
                      <MapPin className="w-2.5 h-2.5" />
                      <span>{hotel?.city}</span>
                    </div>

                    <div className="pt-2 mt-1 border-t border-slate-100 flex items-center gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block leading-tight font-medium">
                          Current
                        </span>
                        <span
                          className={`font-bold text-sm ${
                            hotel.trend === "up"
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {formatINRCurrency(hotel?.total)}
                        </span>
                      </div>
                      <div className="border-l border-slate-100 pl-3">
                        <span className="text-[10px] text-slate-400 block leading-tight font-medium">
                          Prev
                        </span>
                        <span className="font-semibold text-slate-400 text-xs">
                          {formatINRCurrency(hotel?.previous_total)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Show More */}
              {hotelCategories.length > 10 && (
                <button
                  onClick={() => setShowAllHotels(!showAllHotels)}
                  className="w-full mt-3 bg-slate-50 hover:bg-slate-100 rounded-xl p-2.5 flex items-center justify-center space-x-1.5 text-slate-600 font-bold transition-all text-xs active:scale-[0.98] border border-slate-100"
                >
                  <span>
                    {showAllHotels
                      ? "Show Less"
                      : `Show ${hotelCategories.length - 10} More Hotels`}
                  </span>
                  {showAllHotels ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>

            {/* Service Categories & Distribution */}
            <div className="lg:col-span-1 space-y-4">
              {/* Pie Chart */}
              <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100/80">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
                    <PieChartIcon className="w-3.5 h-3.5 text-teal-500" />
                  </div>
                  <h3 className="text-xs md:text-sm font-bold text-slate-700 tracking-tight">
                    Service Distribution
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={serviceCategories}
                      cx="50%"
                      cy="42%"
                      innerRadius={45}
                      outerRadius={72}
                      fill="#8884d8"
                      dataKey="total"
                      labelLine={false}
                      strokeWidth={2}
                      stroke="#fff"
                    >
                      {serviceCategories.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={LCOLORS[index % LCOLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(total) => [
                        `${formatINRCurrency(total)}`,
                        "Revenue",
                      ]}
                      contentStyle={{
                        backgroundColor: "rgba(255,255,255,0.95)",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    />
                    <Legend
                      formatter={(value, entry) => (
                        <span className="text-[10px] font-semibold text-slate-500">
                          {entry.payload.category_name} (
                          {(
                            (entry.payload.total /
                              (serviceCategories.reduce(
                                (sum, item) => sum + item.total,
                                0
                              ) || 1)) *
                            100
                          ).toFixed(1)}
                          %)
                        </span>
                      )}
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={6}
                      wrapperStyle={{ paddingTop: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Service Categories Grid */}
              <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100/80">
                <h2 className="text-xs md:text-sm font-bold text-slate-700 mb-3">
                  Service Categories
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {serviceCategories.map((service, index) => (
                    <div
                      key={service.category_name}
                      className="bg-gradient-to-br from-slate-50/80 to-white rounded-xl p-3 border border-slate-100 hover:border-slate-200 transition-all duration-200"
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              LCOLORS[index % LCOLORS.length],
                          }}
                        />
                        <span className="text-[11px] font-semibold text-slate-400 truncate">
                          {service.category_name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-800 truncate block">
                        {formatINRCurrency(service.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scrollbar hide styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default AdminPage;
