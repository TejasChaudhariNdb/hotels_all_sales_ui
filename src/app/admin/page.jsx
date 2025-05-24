"use client";

import React, { useState,useEffect } from "react";
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
} from "recharts";
import { makeGet } from "@/lib/api";
const AdminPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Today");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [showAllHotels, setShowAllHotels] = useState(false);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [hotelCategories, setHotelCategories] = useState([]);
  const [totalSalesData, setTotalSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [totalSalesAmount, setTotalSalesAmount] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await makeGet("/admin/dashboard", {
          fromDate: selectedDate,
          toDate: toDate,
        });
        setServiceCategories(data.sales_by_categories)
        setHotelCategories(data.sales_by_hotel)
        setTotalSalesData(data.sales_trend)
        setCategoryData(data.salesByCategoryType)
        setCityData(data.salesByCity)
        setTotalSalesAmount(data.total_sales_amount)

      } catch (error) {
        console.error("Dashboard fetch error", error);
      }
    };

    fetchData();
  }, [selectedPeriod, selectedDate, toDate]);




  const formatINRCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);



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

  const StatCard = ({ title, value, change, trend, icon: Icon }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-md font-medium text-gray-600 mb-1">{title}</h3>
        <div
          className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${
            trend === "up"
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

      <p className="text-xl font-bold text-gray-900">
        {formatINRCurrency(value)}
      </p>
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-blue-100 text-sm">Sales Analytics & Overview</p>
          </div>
          <div className="p-2 bg-white/20 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex space-x-2 mt-4">
          {["Today", "Week", "Month"].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? "bg-white text-blue-600"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}>
              {period}
            </button>
          ))}
        </div>

        {/* Date Range Picker */}
        <div className="mt-3">
          <div className="flex items-center space-x-2 bg-white/20 rounded-lg p-2">
            <Calendar className="w-4 h-4 text-white" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white placeholder-white/70 text-sm outline-none"
              placeholder="From"
            />
            <span className="text-white text-sm">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent text-white placeholder-white/70 text-sm outline-none"
              placeholder="To"
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Today's Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex justify-between">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Today's Summary
          </h3>
          <div className="flex items-center space-x-1 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <p className="text-gray-600 text-sm">Growth</p>
              </div>
        </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatINRCurrency(totalSalesAmount)}</p>
            </div>
            <div>
            <p className="text-gray-500 text-xs">from yesterday</p>
              <p className="text-2xl font-bold text-green-600">+12.5%</p>

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
                change={12}
                trend="up"
                icon={DollarSign}
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
              <YAxis fontSize={12} />
              <Tooltip
                formatter={(value) => [`${formatINRCurrency(value)}`, "Sales"]}
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
            {displayedHotels.map((hotel,index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${COLORS[index % COLORS.length]}20` }}>
                    <Bed className="w-5 h-5" style={{ color: COLORS[index % COLORS.length] }} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{hotel?.city}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-800 mb-1">
                  {hotel?.hotel_name}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900">
                    {formatINRCurrency(hotel?.total)}
                  </p>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-yellow-600">⭐</span>
                    <span className="text-xs text-gray-600">
                      5
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hotelCategories.length > 10 && (
            <button
              onClick={() => setShowAllHotels(!showAllHotels)}
              className="w-full mt-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-center space-x-2 text-blue-600 hover:bg-blue-50 transition-colors">
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

        {/* Service Categories Pie Chart */}
        <ChartCard title="Service Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={serviceCategories}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="total"
                label={({ category_name, percent }) =>
                  `${category_name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
                fontSize={10}>
                {serviceCategories.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(total) => [`${formatINRCurrency(total)}`, "Revenue"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default AdminPage;
