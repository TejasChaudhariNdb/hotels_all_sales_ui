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
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <svg className="animate-spin h-6 w-6 text-slate-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-8">

      {/* Header Card */}
      <div className="bg-white shadow-sm rounded-xl mb-4">
        <div className="px-5 py-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                <h1 className="text-xl font-bold text-slate-900">{city}</h1>
              </div>
              <p className="text-sm text-slate-500 font-medium">{dateRangeDisplay}</p>
            </div>

            <div className="text-right">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Revenue</p>
              <p className="text-xl font-extrabold text-slate-900">
                {formatINRCurrency(totalRevenue)}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-200/60 rounded-lg">
                  <Building2 className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hotels</p>
                  <p className="text-2xl font-extrabold text-slate-800">{hotels.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-200/60 rounded-lg">
                  <Star className="w-4 h-4 text-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Hotel</p>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {topPerformer ? topPerformer.hotel_name : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hotels List Container */}
      <div className="px-0 pb-6">
        {/* Hotel List - Ordered by Revenue */}
        <div className="space-y-3">
        {displayedHotels
          .sort((a, b) => (b.total || 0) - (a.total || 0))
          .map((hotel, index) => (
          <Link
            href={`/admin/hotel?hotel_id=${hotel.hotel_id}&from_date=${fromDate}&to_date=${toDate}`}
            key={index}
            className="flex items-center bg-white rounded-xl px-4 py-4 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* Rank + Icon */}
            <div className="flex items-center gap-3 mr-4">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                index === 0 ? 'bg-amber-100 text-amber-700' :
                index === 1 ? 'bg-slate-100 text-slate-600' :
                index === 2 ? 'bg-orange-100 text-orange-700' :
                'bg-slate-100 text-slate-500'
              }`}>
                {index + 1}
              </div>
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${COLORS[index % COLORS.length]}18` }}
              >
                <Bed
                  className="w-4 h-4"
                  style={{ color: COLORS[index % COLORS.length] }}
                />
              </div>
            </div>

            {/* Hotel Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-800 truncate">{hotel?.hotel_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-extrabold text-slate-900">{formatINRCurrency(hotel?.total)}</span>
                <span className="text-xs text-slate-400 font-medium">Prev: {formatINRCurrency(hotel?.previous_total)}</span>
              </div>
            </div>

            {/* Trend Badge + Arrow */}
            <div className="flex items-center gap-2 ml-3 flex-shrink-0">
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                  hotel.trend === "up"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {hotel.trend === "up" ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span>{hotel?.change_percent}%</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </Link>
        ))}
        </div>

        {/* Load More */}
        {hotels.length > 7 && (
          <button
            onClick={() => setShowAllHotels(!showAllHotels)}
            className="w-full mt-4 bg-slate-800 hover:bg-slate-900 rounded-xl p-3.5 text-white font-semibold flex items-center justify-center gap-2 text-sm transition-all active:scale-95"
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
    </div>
  );
}