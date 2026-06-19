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
  Legend
} from "recharts";
import { makeGet } from "@/lib/api";
import SalesFilter from "@/components/SalesFilter";
import Link from 'next/link';
const LOCAL_DATE_KEY = "dashboardDateFilters";
const formatDate = (input) => {
  const date = new Date(input);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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


    }, 500); // 500ms debounce

    return () => clearTimeout(debounceTimeout); // cleanup previous timeout
  }, [selectedPeriod]);


  const fetchData = async () => {
    setLoading(true);
    try {

      const query = new URLSearchParams();

      selectedCities?.forEach((id) => query.append("city_ids[]", id));
      selectedCategories?.forEach((id) => query.append("category_ids[]", id));
      selectedHotels?.forEach((id) => query.append("hotel_ids[]", id));
      selectedSalesCategories?.forEach((id) => query.append("sales_catogory_ids[]", id));
      console.log(query.toString())

      const data = await makeGet(`/admin/dashboard?${query.toString()}`, {
        start_date: selectedDate,
        end_date: toDate,
      });

      setServiceCategories(data.sales_by_categories)
      setHotelCategories(data.sales_by_hotel)
      setTotalSalesData(data.sales_trend)
      setCategoryData(data.salesByCategoryType)
      setCityData(data.salesByCity)
      setTotalSalesSummary(data.sales_summary)
      setLoading(false);

    } catch (error) {
      console.error("Dashboard fetch error", error);
      setLoading(false);
    }
  };


  const getStartOfWeek = (date) => {
    const day = date.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = (day === 0 ? -6 : 1) - day; // make Monday the first day
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

  const getStartOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const getEndOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);


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
        to.setDate(to.getDate() - 1); // Sunday of last week
        from = getStartOfWeek(to);    // Monday of last week
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
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
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
    // Add your apply logic here

    localStorage.setItem(
      LOCAL_DATE_KEY,
      JSON.stringify({
        selectedDate,
        toDate,
        selectedPeriod,
      })
    );
    fetchData()
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
    "#3182CE", // Ocean blue
    "#38A169", // Emerald green
    "#D69E2E", // Golden yellow
    "#805AD5", // Royal purple
    "#DD6B20", // Warm orange
    "#E53E3E", // Vibrant red
    "#319795", // Teal
    "#E53E3E", // Coral red
    "#553C9A", // Deep purple
    "#2B6CB0", // Sky blue
    "#276749", // Forest green
    "#B7791F", // Amber
    "#C53030", // Cherry red
    "#2C5282", // Navy blue
    "#2F855A", // Pine green
    "#ED8936", // Sunset orange
    "#6B46C1", // Indigo
    "#0987A0", // Turquoise
    "#B83280", // Magenta
    "#744210", // Bronze
    "#1A202C", // Charcoal
    "#2A4365", // Midnight blue
    "#1A365D", // Steel blue
    "#2D3748", // Slate gray
    "#4A5568", // Cool gray
  ];

  const tformatINRCurrency = (value) =>
    `₹${Number(value).toLocaleString('en-IN')}`;

  const StatCard = ({ title, value, change, trend, prev }) => (
    <div className="bg-white rounded-xl p-3.5 md:p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <Link href={`/admin/city?city=${title}&from_date=${selectedDate}&to_date=${toDate}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs md:text-sm font-bold text-slate-600 uppercase tracking-wider">{title}</h3>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] md:text-xs font-bold ${trend === "up" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              }`}
          >
            {trend === "up" ? (
              <TrendingUp className="w-3 h-3 md:w-3.5 md:h-3.5" />
            ) : (
              <TrendingDown className="w-3 h-3 md:w-3.5 md:h-3.5" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        </div>
        <div className="mt-1">
          <p className="text-base md:text-2xl font-extrabold text-slate-900 leading-tight">{formatINRCurrency(value)}</p>
          <p className="text-[11px] md:text-sm font-medium text-slate-400 mt-1">Prev: {formatINRCurrency(prev)}</p>
        </div>
      </Link>
    </div>
  );

  const ChartCard = ({ title, children, className = "" }) => (
    <div className={`bg-white rounded-xl p-4 md:p-6 shadow-sm ${className}`}>
      <h3 className="text-sm md:text-base font-bold text-slate-800 mb-4 tracking-tight">{title}</h3>
      {children}
    </div>
  );



  const displayedHotels = showAllHotels
    ? hotelCategories
    : hotelCategories.slice(0, 10);


  const handleFilter = async ({ cities, categories, hotels, salesCategory }) => {
    try {

      setLoading(true);
      const query = new URLSearchParams();

      cities?.forEach((id) => query.append("city_ids[]", id));
      categories?.forEach((id) => query.append("category_ids[]", id));
      hotels?.forEach((id) => query.append("hotel_ids[]", id));
      salesCategory?.forEach((id) => query.append("sales_catogory_ids[]", id));

      setSelectedCities(cities)
      setSelectedCategories(categories)
      setSelectedHotels(hotels)
      setSelectedSalesCategories(salesCategory)


      try {
        const data = await makeGet(`/admin/dashboard?${query.toString()}`, {
          start_date: selectedDate,
          end_date: toDate,
        });
        setServiceCategories(data.sales_by_categories)
        setHotelCategories(data.sales_by_hotel)
        setTotalSalesData(data.sales_trend)
        setCategoryData(data.salesByCategoryType)
        setCityData(data.salesByCity)
        setTotalSalesSummary(data.sales_summary)
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

    // Format date to yyyy-mm-dd string
    const yyyy = yesterday.getFullYear();
    const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
    const dd = String(yesterday.getDate()).padStart(2, '0');
    const yesterdayStr = `${yyyy}-${mm}-${dd}`;

    if (from === yesterdayStr && to === yesterdayStr) {
      return "yesterday";
    }
    return `${from} - ${to}`;
  }


  const today = new Date().toISOString().split('T')[0];

  const isToday =
    selectedDate === today &&
    toDate === today;


  const funnelData = serviceCategories
    .sort((a, b) => b.total - a.total)
    .map((item, index) => ({
      name: item.category_name,
      value: item.total,
      fill: COLORS[index % COLORS.length]
    }));
  return (
    <div className="min-h-screen bg-slate-50/50 pb-8 px-2 md:px-3">
      {/* Header filter container */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <div className="space-y-3">
          {/* Period Selector */}
          <div className="flex mb-1 overflow-x-auto no-scrollbar whitespace-nowrap gap-1.5 pb-1">
            {["Today", "Yesterday", "Last Yesterday", "Week", "Last Week", "14 Days", "Month", "Last Month"].map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`py-1 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${selectedPeriod === period
                  ? "bg-slate-800 text-white shadow-sm active:scale-95"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95"
                  }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Date Range Selector with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100/60 rounded-lg text-left transition-all font-semibold text-xs text-slate-700 focus:outline-none h-9"
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {selectedDate === toDate
                    ? formatDate(selectedDate)
                    : `${formatDate(selectedDate)} - ${formatDate(toDate)}`}
                </span>
              </div>
              {isDateFilterOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            {/* Dropdown Container */}
            {isDateFilterOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-xl p-4 border border-slate-200 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      From
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-400 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      To
                    </label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-400 transition-all"
                    />
                  </div>
                </div>
                <button
                  onClick={applyDateFilter}
                  className="bg-slate-800 hover:bg-slate-900 text-white py-1.5 rounded-lg transition-all w-full font-semibold shadow-sm active:scale-95 text-xs h-9"
                >
                  Apply Filter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-4">
          <svg
            className="animate-spin h-5 w-5 text-slate-800"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
        </div>
      )}

      {/* Main dashboard content */}
      <div className="space-y-4">
        {/* Toggle options & Filters Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3 rounded-xl shadow-sm">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 text-slate-800 bg-gray-50 border-gray-300 rounded focus:ring-slate-500 focus:ring-1"
              />
              <span className="text-xs font-semibold text-slate-700">Include Margin</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 text-slate-800 bg-gray-50 border-gray-300 rounded focus:ring-slate-500 focus:ring-1"
              />
              <span className="text-xs font-semibold text-slate-700">Include Expense</span>
            </label>
          </div>

          <SalesFilter onApplyFilter={handleFilter} hotel_type={0} />
        </div>

        {/* Section 1: KPI Summary & City Performance Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Today's / Period Summary Card */}
          <div className="lg:col-span-1 bg-white rounded-xl p-4 md:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs md:text-base font-bold text-slate-800 tracking-tight">
                  {isToday ? "Today's" : "Period"} Summary
                </h3>
                <div
                  className={`flex items-center space-x-0.5 px-1.5 py-0.5 rounded text-[10px] md:text-xs font-bold ${totalSalesSummary.trend === "up"
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
                  <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">Total Revenue</p>
                  <p className="text-xl md:text-4xl font-extrabold text-slate-900 mt-0.5">
                    {formatINRCurrency(totalSalesSummary.amount)}
                  </p>
                </div>
                <div className="p-2.5 md:p-3.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between shadow-sm">
                  <span className="text-slate-500 text-[11px] md:text-sm font-semibold">Average / Day</span>
                  <span className="font-bold text-slate-800 text-xs md:text-sm">
                    {formatINRCurrency(totalSalesSummary?.average?.value)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] md:text-xs font-medium text-slate-400">
                vs {formatComparedTo(totalSalesSummary?.compared_to?.from, totalSalesSummary?.compared_to?.to)}
              </span>
              <span
                className={`text-sm md:text-xl font-bold ${totalSalesSummary.trend === "up" ? "text-emerald-600" : "text-rose-600"
                  }`}
              >
                {totalSalesSummary.change_percent}%
              </span>
            </div>
          </div>

          {/* City Performance Cards */}
          <div className="lg:col-span-2 bg-white rounded-xl p-4 md:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-xs md:text-base font-bold text-slate-800 mb-3.5 flex items-center gap-1.5">
                <MapPin className="text-slate-500 w-4 h-4 md:w-5 md:h-5" />
                <span>City Performance</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {cityData.map((city) => (
                  <StatCard
                    key={city.city}
                    title={city.city}
                    value={city.total}
                    change={city.change_percent}
                    trend={city.trend}
                    prev={city.previous_total}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Total Sales Trend">
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={totalSalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" fontSize={10} tickLine={false} />
                <YAxis
                  fontSize={10}
                  domain={[0, 'dataMax + 40000']}
                  tickLine={false}
                  tickFormatter={(value) => tformatINRCurrency(value)}
                />
                <Tooltip
                  formatter={(value) => [`${formatINRCurrency(value)}`, "Sales"]}
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#1e293b"
                  strokeWidth={2}
                  dot={{ fill: "#1e293b", strokeWidth: 1.5, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Sales by Category">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category_type_name" fontSize={10} tickLine={false} />
                <YAxis fontSize={10} tickLine={false} />
                <Tooltip
                  formatter={(value) => [`${formatINRCurrency(value)}`, "Sales"]}
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={LCOLORS[index % LCOLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>        {/* Section 3: Hotel Performance & Service Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Hotel Performance */}
          <div className="lg:col-span-2 bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800">
                Hotel Performance
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 font-bold text-slate-500">
                {hotelCategories.length} hotels
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayedHotels.map((hotel, index) => (
                <Link
                  href={`/admin/hotel?hotel_id=${hotel.hotel_id}&from_date=${selectedDate}&to_date=${toDate}`}
                  key={index}
                  className="bg-slate-50 hover:bg-slate-100/60 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 rounded-lg bg-slate-200/60 text-slate-600">
                        <Bed className="w-3.5 h-3.5" />
                      </div>
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold ${hotel.trend === "up"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                          }`}
                      >
                        {hotel.trend === "up" ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{hotel?.change_percent}%</span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 truncate leading-tight">
                      {hotel?.hotel_name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mt-0.5 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>{hotel?.city}</span>
                    </div>
                  </div>

                  <div className="pt-2 mt-1 border-t border-slate-200/60 flex items-center justify-between">
                    <div className="flex gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block leading-tight font-medium">Current</span>
                        <span className={`font-bold text-sm ${hotel.trend === "up" ? "text-emerald-600" : "text-rose-600"
                          }`}>{formatINRCurrency(hotel?.total)}</span>
                      </div>
                      <div className="border-l border-slate-200/60 pl-3">
                        <span className="text-[10px] text-slate-400 block leading-tight font-medium">Prev</span>
                        <span className="font-semibold text-slate-500 text-xs">{formatINRCurrency(hotel?.previous_total)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Toggle More Hotels */}
            {hotelCategories.length > 10 && (
              <button
                onClick={() => setShowAllHotels(!showAllHotels)}
                className="w-full mt-3 bg-slate-50 hover:bg-slate-100 rounded-lg p-2 flex items-center justify-center space-x-1.5 text-slate-700 font-semibold transition-all text-xs active:scale-95 border border-slate-100"
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

          {/* Service Categories Grid & Distribution Chart */}
          <div className="lg:col-span-1 space-y-4">
            {/* Service Distribution Pie Chart */}
            <ChartCard title="Service Distribution">
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie
                    data={serviceCategories}
                    cx="50%"
                    cy="40%"
                    innerRadius={50}
                    outerRadius={75}
                    fill="#8884d8"
                    dataKey="total"
                    labelLine={false}
                  >
                    {serviceCategories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={LCOLORS[index % LCOLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(total) => [`${formatINRCurrency(total)}`, "Revenue"]}
                  />
                  <Legend
                    formatter={(value, entry) => (
                      <span className="text-[10px] font-medium text-slate-600">
                        {entry.payload.category_name} (
                        {(
                          (entry.payload.total /
                            (serviceCategories.reduce((sum, item) => sum + item.total, 0) || 1)) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    )}
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={6}
                    wrapperStyle={{ paddingTop: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Service Categories Grid */}
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-slate-800">
                Service Categories
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                {serviceCategories.map((service) => (
                  <div
                    key={service.category_name}
                    className="bg-slate-50 hover:bg-slate-100/70 rounded-xl p-3 flex flex-col justify-between transition-all"
                  >
                    <span className="text-xs font-semibold text-slate-400 truncate mb-1">
                      {service.category_name}
                    </span>
                    <span className="text-sm font-bold text-slate-800 truncate">
                      {formatINRCurrency(service.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
