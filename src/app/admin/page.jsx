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

  const StatCard = ({ title, value, change, trend,prev}) => (
    <div   className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
     <Link  href={`/admin/city?city=${title}&from_date=${selectedDate}&to_date=${toDate}`}>

 
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-md font-medium text-gray-600 mb-1">{title}</h3>
      <div
          className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${trend === "up"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
            }`}>
          {trend === "up" ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{Math.abs(change)}%</span>
        </div> 
      </div>
<div className="flex justify-between">
<p className="text-xl font-bold text-gray-900">
        {formatINRCurrency(value)}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">
              Prev: {formatINRCurrency(prev)}
            </p>
</div>
</Link>
    </div>
  );

  const ChartCard = ({ title, children, className = "" }) => (
    <div
      className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mx-4 my-4">
        {/* Mobile-first vertical layout */}
        <div className="space-y-4">
          {/* Period Selector - Full width on mobile */}
          <div className="flex  mb-4 overflow-x-auto no-scrollbar whitespace-nowrap gap-3">
            {["Today", "Yesterday",  "Last Yesterday", "Week", "Last Week", "14 Days", "Month", "Last Month"].map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`py-2 px-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedPeriod === period
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 active:bg-slate-100 border border-slate-200"
                  }`}
              >
                {period}
              </button>
            ))}


          </div>

          {/* Date Range Selector with Dropdown */}
          <div className="space-y-2">
            <div className="flex">
              <button
                onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                className="w-full flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-left hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-700 font-medium">
                    {selectedDate === toDate
                      ? formatDate(selectedDate)
                      : `${formatDate(selectedDate)} - ${formatDate(toDate)}`}
                  </span>
                </div>
                {isDateFilterOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

            </div>

            {/* Animated Dropdown */}
            <div
              className={`transition-all duration-300 overflow-hidden ${isDateFilterOpen ? "max-h-[500px]" : "max-h-0"
                }`}
            >
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="space-y-3 mb-4 flex justify-between">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                      From
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                      To
                    </label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <button
                  onClick={applyDateFilter}
                  className="bg-slate-900 text-white px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors w-full font-medium"
                >
                  Apply
                </button>
              </div>
            </div>


          </div>


        </div>
      </div>

      {loading ? (<>  <div className="flex justify-center items-center py-10">
        <svg
          className="animate-spin h-6 w-6 text-indigo-600"
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
      </div></>) : ""}


      <div className="pt-0 p-4 space-y-6" >
        <div className="flex justify-end mb-0 mt-0">
          <SalesFilter onApplyFilter={handleFilter} hotel_type={0} />

        </div>

        {/* Today's Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {isToday ? "Today's" : "Date"} Summary

            </h3>
            <div className="flex items-center space-x-1 mb-1">
              <div
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${totalSalesSummary.trend === "up"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                  }`}>
                {totalSalesSummary.trend === "up" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <p className="text-sm">{totalSalesSummary.label}</p>
              </div>


            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatINRCurrency(totalSalesSummary.amount)}</p>
            </div> */}
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatINRCurrency(totalSalesSummary.amount)}</p>
              <p className="text-sm text-gray-500 mt-1">
                Avg: {formatINRCurrency(totalSalesSummary?.average?.value)}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-xs text-end">
                {formatComparedTo(totalSalesSummary?.compared_to?.from, totalSalesSummary?.compared_to?.to)}
              </p>
              <p
                className={`text-2xl font-bold text-end ${totalSalesSummary.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
              >
                {totalSalesSummary.change_percent}%
              </p>
            </div>
          </div>
        </div>

        {/* City Sales Cards */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            City Performance
          </h2>
          <div className="space-y-3">
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

        {/* Total Sales Line Chart */}
        <ChartCard title="Total Sales Trend">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={totalSalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" fontSize={12} />

              <YAxis
                fontSize={12}
                domain={[0, 'dataMax + 40000']}
                tickCount={14}
                tickFormatter={(value) => tformatINRCurrency(value)}
              />
              <Tooltip
                formatter={(value) => [`${formatINRCurrency(value)}`, "Sales"]}
                contentStyle={{
                  backgroundColor: "white",
                  color: "black",
                  borderRadius: "8px",
                  padding: "7px",
                }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#4F46E5"
                strokeWidth={2}
                dot={{ fill: "#4F46E5", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>


   {/* Hotel Categories Grid */}
   <div>
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-lg font-semibold text-gray-800">
      Hotel Performance
    </h2>
    <span className="text-sm text-gray-500">
      {hotelCategories.length} hotels
    </span>
  </div>

  <div className="grid grid-cols-1 gap-3">
    {displayedHotels.map((hotel, index) => (
      <Link
      href={`/admin/hotel?hotel_id=${hotel.hotel_id}&from_date=${selectedDate}&to_date=${toDate}`}
        key={index}
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${COLORS[index % COLORS.length]}20` }}>
            <Bed
              className="w-5 h-5"
              style={{ color: COLORS[index % COLORS.length] }}
            />
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
          <div
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${hotel.trend === "up"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                  }`}>
                {hotel.trend === "up" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <p className="text-sm"> {hotel?.change_percent}%</p>
              </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-800 mb-1">
          {hotel?.hotel_name}
        </h3>

        <div className="flex items-center space-x-2 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>{hotel?.city}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
 
          
</div>
        <div className="flex items-center justify-between">
          {/* Current Total */}
          <div>
            <p className="text-lg font-bold text-gray-900">
              {formatINRCurrency(hotel?.total)}
            </p>
      
          </div>
      {/* Previous Total - small & muted */}
      <p className="text-xs text-gray-500 mt-0.5">
              Prev: {formatINRCurrency(hotel?.previous_total)}
            </p>
        </div>
      </Link>
    ))}
  </div>

  {/* Toggle More Hotels */}
  {hotelCategories.length > 10 && (
    <button
      onClick={() => setShowAllHotels(!showAllHotels)}
      className="w-full mt-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-center space-x-2 text-blue-600 hover:bg-blue-50 transition-colors"
    >
      <span className="font-medium">
        {showAllHotels
          ? "Show Less Hotels"
          : `Show ${hotelCategories.length - 10} More Hotels`}
      </span>
      {showAllHotels ? (
        <ChevronUp className="w-4 h-4" />
      ) : (
        <ChevronDown className="w-4 h-4" />
      )}
    </button>
  )}
</div>


        {/* Category Sales Bar Chart */}
        <ChartCard title="Sales by Category">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category_type_name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip
                formatter={(value) => [`${formatINRCurrency(value)}`, "Sales"]}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>



        {/* Service Categories Grid */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Service Categories
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {serviceCategories.map((service) => {

              return (
                <div
                  key={service.category_name}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">
                      {service.category_name}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>

                  <p className="text-lg font-bold text-gray-900">
                    {formatINRCurrency(service.total)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>


        {/* Service Categories Pie Chart */}
        <ChartCard title="Service Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>

              <Pie
                data={serviceCategories}
                cx="50%"
                cy="50%"
                innerRadius={60} outerRadius={90}
                fill="#8884d8"
                dataKey="total"
                label={({ category_name, percent }) =>
                  `${category_name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={true}
                fontSize={12}
                fontWeight="600"
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
                formatter={(value, entry) => `${entry.payload.category_name} (${((entry.payload.total / serviceCategories.reduce((sum, item) => sum + item.total, 0)) * 100).toFixed(1)}%)`}
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>




      </div>
    </div>
  );
};

export default AdminPage;
