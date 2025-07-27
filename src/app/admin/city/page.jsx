"use client"
import { useEffect, useState } from "react";
import { Bed, ChevronRight, TrendingUp, TrendingDown, MapPin, ChevronDown, ChevronUp, Building2, Star } from "lucide-react";
import Link from "next/link";
import { makePost } from "@/lib/api";

const COLORS = ["#4f46e5", "#ec4899", "#10b981", "#f59e0b", "#6366f1", "#8b5cf6"];

export default function HotelSalesByCityPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAllHotels, setShowAllHotels] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const city = searchParams.get("city");
  const fromDate = searchParams.get("from_date");
  const toDate = searchParams.get("to_date");

  const formatINRCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const calculateDateDifference = (fromDate, toDate) => {
    if (!fromDate || !toDate) return "";
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await makePost("/admin/hotel-sales-by-city", {
          city,
          from_date: fromDate,
          to_date: toDate,
        });
        setHotels(res || []);
      } catch (error) {
        console.error("Failed to fetch hotels", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [city, fromDate, toDate]);

  const displayedHotels = showAllHotels ? hotels : hotels.slice(0, 7);
  const totalRevenue = hotels.reduce((sum, hotel) => sum + (hotel.total || 0), 0);
  const topPerformer = hotels.length > 0 ? hotels.reduce((prev, current) => (prev.total > current.total) ? prev : current) : null;

  // Date range display
  const formattedFromDate = formatDate(fromDate);
  const formattedToDate = formatDate(toDate);
  const daysDiff = calculateDateDifference(fromDate, toDate);
  
  let dateRangeDisplay = "";
  if (fromDate === toDate) {
    dateRangeDisplay = formattedFromDate;
  } else {
    dateRangeDisplay = `${formattedFromDate} - ${formattedToDate} (${daysDiff} days)`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-4">
          <div className="text-center py-8">
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <br />

      <div className="bg-white p-4 pb-6 shadow-md m-3 rounded-lg mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            
           
            <div className="flex items-center space-x-2 mb-2">
            
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{city}</h1>
            </div>
            <p className="text-sm text-blue-600 font-medium">{dateRangeDisplay}</p>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
            <p className="text-xl font-bold text-gray-900">
              {formatINRCurrency(totalRevenue)}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">Hotels</p>
                <p className="text-2xl font-bold text-blue-900">{hotels.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <Star className="w-5 h-5 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-green-700 font-medium">Top Hotel</p>
                <p className="text-sm font-bold text-green-900 truncate">
                  {topPerformer ? topPerformer.hotel_name : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hotels List Container */}
      <div className="px-4 pb-6">

        {/* Hotel List - Ordered by Revenue */}
        <div className="space-y-3">
        {displayedHotels
          .sort((a, b) => (b.total || 0) - (a.total || 0)) // Order by revenue descending
          .map((hotel, index) => (
          <Link
            href={`/admin/hotel?hotel_id=${hotel.hotel_id}&from_date=${fromDate}&to_date=${toDate}`}
            key={index}
            className="block bg-white rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {/* Rank Number */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  index === 2 ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {index + 1}
                </div>
                
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${COLORS[index % COLORS.length]}20` }}
                >
                  <Bed
                    className="w-5 h-5"
                    style={{ color: COLORS[index % COLORS.length] }}
                  />
                </div>
              </div>
              
              <div
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                  hotel.trend === "up"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {hotel.trend === "up" ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{hotel?.change_percent}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {hotel?.hotel_name}
              </h3>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatINRCurrency(hotel?.total)}
                </p>
              </div>
              <p className="text-sm text-gray-500">
                Prev: {formatINRCurrency(hotel?.previous_total)}
              </p>
            </div>
          </Link>
        ))}
        </div>

        {/* Load More */}
        {hotels.length > 7 && (
          <button
            onClick={() => setShowAllHotels(!showAllHotels)}
            className="w-full mt-4 bg-gray-50 rounded-xl p-4 text-blue-600 font-medium flex items-center justify-center space-x-2"
          >
            <span>
              {showAllHotels
                ? "Show Less"
                : `Show ${hotels.length - 7} More Hotels`}
            </span>
            {showAllHotels ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      <br />
      <br />
      <br />
    </div>
  );
}