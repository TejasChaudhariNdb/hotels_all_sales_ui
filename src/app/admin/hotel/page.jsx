"use client"
import React, { useEffect, useState } from "react";
import { makePost } from "@/lib/api"; // adjust this path if needed

const HotelCategorySalesPage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hotelName, setHotelName] = useState("");
  const [dateRange, setDateRange] = useState("");

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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const fetchHotelCategorySales = async () => {
    try {
      setLoading(true);

      const searchParams = new URLSearchParams(window.location.search);
      const from_date = searchParams.get("from_date");
      const to_date = searchParams.get("to_date");
      const hotel_id = searchParams.get("hotel_id");

      if (!from_date || !to_date || !hotel_id) {
        console.warn("Missing query parameters.");
        return;
      }

      // Set date range display
      const formattedFromDate = formatDate(from_date);
      const formattedToDate = formatDate(to_date);
      const daysDiff = calculateDateDifference(from_date, to_date);
      
      if (from_date === to_date) {
        setDateRange(`${formattedFromDate}`);
      } else {
        setDateRange(`${formattedFromDate} - ${formattedToDate} (${daysDiff} days)`);
      }

      const res = await makePost("admin/hotel-category-sales", {
        hotel_id,
        from_date,
        to_date,
      });

      const data = res || [];
      setSales(data.sales);
      
      // Extract hotel name from first record if available
   
        setHotelName(data.hotel_name);
 
      
      console.log("Fetched hotel category sales:", data);
    } catch (error) {
      console.error("Error fetching hotel category sales:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotelCategorySales();
  }, []);

  const totalAmount = sales.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{hotelName}</h1>
              
                {dateRange && (
                  <p className="text-sm text-blue-600 mt-1">{dateRange}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading category sales...</span>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No category sales found</h3>
            <p className="text-gray-500">No sales data available for the selected period.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Categories</p>
                    <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg per Category</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{Math.round(totalAmount / sales.length).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Top Category</p>
                    <p className="text-lg font-bold text-gray-900 truncate">
                      {sales.length > 0 ? sales.reduce((prev, current) => (prev.amount > current.amount) ? prev : current).category_name : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Sales by Category</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        % of Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sales
                      .sort((a, b) => b.amount - a.amount)
                      .map((item, index) => {
                        const percentage = ((item.amount / totalAmount) * 100).toFixed(1);
                        return (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                  index === 1 ? 'bg-gray-100 text-gray-800' :
                                  index === 2 ? 'bg-orange-100 text-orange-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {index + 1}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {item.category_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm font-semibold text-gray-900">
                                ₹{item.amount.toLocaleString("en-IN")}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end">
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600 min-w-[3rem]">
                                    {percentage}%
                                  </span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        <br />
        <br />
        <br />
      </div>
    </div>
  );
};

export default HotelCategorySalesPage;