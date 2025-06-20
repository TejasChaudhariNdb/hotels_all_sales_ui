"use client";
import React, { useEffect, useState } from "react";
import { AlertCircle, Calendar, Hotel, ChevronDown, ChevronUp } from "lucide-react";
import { makeGet } from "@/lib/api";

export default function Page() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedHotels, setExpandedHotels] = useState(new Set());

  // Format date for readability
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    fetchMissingSales();
  }, []);

  const fetchMissingSales = async () => {
    try {
      setLoading(true);

      const searchParams = new URLSearchParams(window.location.search);
      const start = searchParams.get("start");
      const todate = searchParams.get("todate");

      const res = await makeGet("/missing-sales", {
        start_date: start,
        end_date: todate,
      });

      const data = res.data || [];
      setHotels(data);
      console.log("Fetched hotels with missing sales:", data);
      console.log(hotels)
    } catch (error) {
      console.error("Error fetching missing sales:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle hotel expansion
  const toggleHotelExpansion = (index) => {
    const newExpanded = new Set(expandedHotels);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedHotels(newExpanded);
  };
  
  // Safely compute total
  const totalMissingDates = hotels?.reduce(
    (sum, hotel) =>
      sum + (Array.isArray(hotel?.missing_sales_dates) ? hotel.missing_sales_dates.length : 0),
    0
  );

  // Filtered hotels count
  const hotelsWithMissing = hotels?.filter(
    (h) => Array.isArray(h.missing_sales_dates) && h.missing_sales_dates.length > 0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hotel data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow border">
            <div className="flex items-start gap-4">
              <Hotel className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-slate-500 text-2xl font-bold">{hotelsWithMissing.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow border">
            <div className="flex items-start gap-4">
              <Calendar className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-slate-500 text-2xl font-bold">{totalMissingDates}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hotels with Missing Sales Data - Mobile Optimized */}
        <div >
          {/* Section Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Missing Sales Data</h2>
    
          </div>

          {/* Hotels List */}
          <div className="space-y-3">
            {hotelsWithMissing.map((hotel, index) => {
              const missingCount = hotel.missing_sales_dates.length;
              const isExpanded = expandedHotels.has(index);
              
              // Severity styling
              const getSeverityColor = (count) => {
                if (count >= 10) return "bg-red-50 border-red-200";
                if (count >= 7) return "bg-orange-50 border-orange-200";
                if (count >= 4) return "bg-amber-50 border-amber-200";
                return "bg-blue-50 border-blue-200";
              };

              const getBadgeColor = (count) => {
                if (count >= 10) return "bg-red-100 text-red-700";
                if (count >= 7) return "bg-orange-100 text-orange-700";
                if (count >= 4) return "bg-amber-100 text-amber-700";
                return "bg-blue-100 text-blue-700";
              };

              return (
                <div
                  key={index}
                  className={`${getSeverityColor(missingCount)} border rounded-xl overflow-hidden`}
                >
                  {/* Hotel Header - Clickable */}
                  <div 
                    className="p-4 cursor-pointer active:bg-gray-50"
                    onClick={() => toggleHotelExpansion(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">
                          {hotel.hotel_name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(missingCount)}`}>
                            {missingCount} missing
                          </span>
                        </div>
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Missing Dates</span>
                        </div>
                        
                        {/* Dates Grid - Mobile Optimized */}
                        <div className="grid grid-cols-1 gap-2">
                          {hotel.missing_sales_dates.map((date, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg"
                            >
                              <div className={`w-2 h-2 rounded-full ${
                                missingCount >= 5 ? 'bg-red-400' : 
                                missingCount >= 3 ? 'bg-orange-400' : 
                                missingCount >= 2 ? 'bg-yellow-400' : 'bg-blue-400'
                              }`}></div>
                              <span className="text-sm font-medium text-gray-700">
                                {formatDate(date)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium active:bg-blue-100">
                            Call Manager
                          </button>
                          <button className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium active:bg-green-100">
                            Notifiy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <br />
            <br />
            <br />
            <br />
            <br />
          </div>

          {/* Empty State */}
          {hotelsWithMissing.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Hotel className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All Clear!</h3>
              <p className="text-gray-600 text-sm">No missing sales data found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}