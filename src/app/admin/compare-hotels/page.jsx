"use client";
import { useState, useEffect } from "react";
import { Hotel, Calendar, Search, X, TrendingUp, DollarSign, Award, BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { makeGet, makePost } from "@/lib/api";

export default function CompareHotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingHotels, setFetchingHotels] = useState(true);
  const [comparisonData, setComparisonData] = useState(null);
  const [error, setError] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setFetchingHotels(true);
        const data = await makeGet("admin/filters", { hotel_type: 0 });
        setHotels(data.hotels || []);
      } catch (error) {
        setError("Failed to load hotels");
      } finally {
        setFetchingHotels(false);
      }
    };
    fetchHotels();
  }, []);

  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    setToDate(today.toISOString().split("T")[0]);
    setFromDate(thirtyDaysAgo.toISOString().split("T")[0]);
  }, []);

  const toggleHotelSelection = (hotelId) => {
    setSelectedHotels((prev) => 
      prev.includes(hotelId) ? prev.filter((id) => id !== hotelId) : [...prev, hotelId]
    );
    setError("");
  };

  const removeHotel = (hotelId) => {
    setSelectedHotels((prev) => prev.filter((id) => id !== hotelId));
  };

  const handleCompare = async () => {
    if (selectedHotels.length < 2) {
      setError("Please select at least 2 hotels to compare");
      return;
    }
    if (!fromDate || !toDate) {
      setError("Please select both from and to dates");
      return;
    }
    if (new Date(toDate) < new Date(fromDate)) {
      setError("To date must be after or equal to from date");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await makePost("/admin/compare-hotels", {
        hotel_ids: selectedHotels,
        from_date: fromDate,
        to_date: toDate,
      });
      setComparisonData(response);
    } catch (error) {
      setError("Failed to compare hotels. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedHotelNames = () => {
    return selectedHotels.map((id) => hotels.find((h) => h.id === id)?.name).filter(Boolean);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const getMaxAmount = (hotels) => {
    return Math.max(...hotels.map(h => h.amount));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
              <Hotel className="text-white" size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Compare Hotels
            </h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            Select at least 2 hotels and a date range to compare their performance
          </p>
        </div>

        {/* Hotel Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-100">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" />
            Select Hotels (Minimum 2)
          </h2>

          {fetchingHotels ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500">Loading hotels...</p>
            </div>
          ) : (
            <>
              {selectedHotels.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex flex-wrap gap-2">
                    {getSelectedHotelNames().map((name, idx) => {
                      const hotelId = selectedHotels[idx];
                      return (
                        <span key={hotelId} className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-md">
                          {name}
                          <button onClick={() => removeHotel(hotelId)} className="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-colors">
                            <X size={14} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-xs text-blue-700 mt-2 font-medium">
                    {selectedHotels.length} hotel(s) selected
                  </p>
                </div>
              )}

              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-2">
                {hotels.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No hotels available</div>
                ) : (
                  hotels.map((hotel) => (
                    <button key={hotel.id} onClick={() => toggleHotelSelection(hotel.id)} className={`w-full text-left p-3 rounded-lg border-2 transition-all ${selectedHotels.includes(hotel.id) ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-500 shadow-md" : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800">{hotel.name}</span>
                        {selectedHotels.includes(hotel.id) && (
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-sm font-bold">✓</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Date Range Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-100">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" />
            Select Date Range
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} min={fromDate} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
            <div className="bg-red-100 p-1.5 rounded-lg">
              <X className="text-red-600" size={18} />
            </div>
            <p className="text-red-800 text-sm font-medium flex-1">{error}</p>
          </div>
        )}

        {/* Compare Button */}
        <button onClick={handleCompare} disabled={loading || selectedHotels.length < 2 || !fromDate || !toDate} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 px-6 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-base sm:text-lg">
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Comparing...
            </>
          ) : (
            <>
              <Search size={20} />
              Compare Hotels
            </>
          )}
        </button>

        <br />
        <br />
 

        {/* Comparison Results */}
        {comparisonData && (
          <div className="space-y-4 sm:space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign size={28} className="opacity-80" />
                  <span className="text-xs sm:text-sm bg-white bg-opacity-20 px-2 py-1 rounded-full">Total</span>
                </div>
                <p className="text-sm opacity-90 mb-1">Total Sales</p>
                <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(comparisonData.summary.totals.total_sales)}</p>
                <p className="text-xs mt-2 opacity-75">{comparisonData.summary.period.days} days period</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp size={28} className="opacity-80" />
                  <span className="text-xs sm:text-sm bg-white bg-opacity-20 px-2 py-1 rounded-full">Profit</span>
                </div>
                <p className="text-sm opacity-90 mb-1">Total Profit</p>
                <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(comparisonData.summary.totals.total_profit)}</p>
                <p className="text-xs mt-2 opacity-75">Avg: {formatCurrency(comparisonData.summary.averages.average_profit)}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Award size={28} className="opacity-80" />
                  <span className="text-xs sm:text-sm bg-white bg-opacity-20 px-2 py-1 rounded-full">Best</span>
                </div>
                <p className="text-sm opacity-90 mb-1">Top Performer</p>
                <p className="text-lg sm:text-xl font-bold truncate">{comparisonData.summary.best_performer.hotel_name}</p>
                <p className="text-xs mt-2 opacity-75">{formatCurrency(comparisonData.summary.best_performer.profit)} profit</p>
              </div>
            </div>

            {/* Hotel Comparison Cards */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-100">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Hotel size={20} className="text-blue-600" />
                Individual Performance
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {comparisonData.hotels.map((hotel, index) => (
                  <div key={hotel.hotel_id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all hover:shadow-md">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{hotel.hotel_name}</h3>
                        <p className="text-sm text-gray-500">{hotel.hotel_city}</p>
                      </div>
                      {index === 0 && (
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          #1
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <p className="text-xs text-green-700 font-medium mb-1">Total Sales</p>
                        <p className="text-xl font-bold text-green-800">{formatCurrency(hotel.sales.total)}</p>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-blue-700 font-medium mb-1">Profit</p>
                        <p className="text-xl font-bold text-blue-800">{formatCurrency(hotel.profit)}</p>
                        <p className="text-xs text-blue-600 mt-1">Margin: {hotel.profit_margin}%</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-700 font-medium mb-2">Sales by Category</p>
                        <div className="space-y-2">
                          {hotel.sales.by_category.map((cat) => (
                            <div key={cat.category_id} className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">{cat.category_name}</span>
                              <span className="text-sm font-semibold text-gray-800">{formatCurrency(cat.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Comparison */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-100">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-600" />
                Category Comparison
              </h2>
              <div className="space-y-4">
                {comparisonData.category_comparison.map((category) => {
                  const maxAmount = getMaxAmount(category.hotels);
                  const isExpanded = expandedCategories[category.category_id];

                  return (
                    <div key={category.category_id} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                      <button onClick={() => toggleCategory(category.category_id)} className="w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-500 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                            {category.category_name[0]}
                          </div>
                          <div className="text-left">
                            <h3 className="font-bold text-gray-800">{category.category_name}</h3>
                            <p className="text-xs text-gray-500">Margin: {category.margin}%</p>
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp size={20} className="text-gray-600" /> : <ChevronDown size={20} className="text-gray-600" />}
                      </button>

                      {isExpanded && (
                        <div className="p-4 space-y-3">
                          {category.hotels.map((hotel) => {
                            const percentage = (hotel.amount / maxAmount) * 100;
                            return (
                              <div key={hotel.hotel_id} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-700">{hotel.hotel_name}</span>
                                  <span className="text-sm font-bold text-gray-800">{formatCurrency(hotel.amount)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out shadow-sm" style={{ width: `${percentage}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}