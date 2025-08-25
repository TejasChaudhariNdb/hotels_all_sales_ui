"use client"
import React, { useEffect, useState } from "react";
import { makePost } from "@/lib/api"; // adjust this path if needed

const HotelCategorySalesPage = () => {
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState({});
  const [meta, setMeta] = useState({});
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

      const data = res || {};
      setSales(data.sales || []);
      setExpenses(data.expenses || {});
      setMeta(data.meta || {});
      setHotelName(data.hotel_name || "");
      
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

  const totalSales = sales.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.total || 0;
  
  // Calculate total gross profit using margin for each category
  const totalGrossProfit = sales.reduce((sum, item) => {
    const marginAmount = (item.amount * item.margin) / 100;
    return sum + marginAmount;
  }, 0);
  
  // Net profit = Gross profit - Expenses
  const netProfit = totalGrossProfit - (totalExpenses);

  // Expense categories for display
  const expenseCategories = [
    { key: 'rent', label: 'Rent', icon: '🏠' },
    { key: 'license_fee', label: 'License Fee', icon: '📋' },
    { key: 'salary', label: 'Salary', icon: '👥' },
    { key: 'light_bill', label: 'Electricity', icon: '💡' },
    { key: 'interest', label: 'Interest', icon: '💰' },
    { key: 'miscellaneous', label: 'Miscellaneous', icon: '📦' },
  ];

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
                {meta.selected_days && (
                  <p className="text-xs text-gray-500 mt-1">
                    {meta.selected_days} of {meta.days_in_month} days selected
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Net Profit</p>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{netProfit.toLocaleString("en-IN")}
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
            <span className="ml-3 text-gray-600">Loading financial data...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Sales</p>
                    <p className="text-xl font-bold text-green-600">
                      ₹{totalSales.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Gross Profit</p>
                    <p className="text-xl font-bold text-blue-600">
                      ₹{totalGrossProfit.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-xl font-bold text-red-600">
                      ₹{(totalExpenses).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Categories</p>
                    <p className="text-xl font-bold text-blue-600">{sales.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <svg className={`w-6 h-6 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Net Profit</p>
                    <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{netProfit.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales and Expenses Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sales Table */}
              {sales.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
                    <h2 className="text-lg font-semibold text-gray-900">Revenue by Category</h2>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Category
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Sales
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Margin
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Profit
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Share
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sales
                          .sort((a, b) => b.amount - a.amount)
                          .map((item, index) => {
                            const percentage = ((item.amount / totalSales) * 100).toFixed(1);
                            const categoryProfit = (item.amount * item.margin) / 100;
                            return (
                              <tr key={item.category_id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <div className="flex items-center">
                                    <span className={`w-3 h-3 rounded-full mr-3 ${
                                      index === 0 ? 'bg-green-500' :
                                      index === 1 ? 'bg-blue-500' :
                                      index === 2 ? 'bg-purple-500' :
                                      'bg-gray-400'
                                    }`}></span>
                                    <span className="text-sm font-medium text-gray-900">
                                      {item.category_name}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="text-sm font-semibold text-gray-900">
                                    ₹{item.amount.toLocaleString("en-IN")}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    item.margin > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {item.margin}%
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className={`text-sm font-semibold ${
                                    categoryProfit > 0 ? 'text-green-600' : 'text-gray-500'
                                  }`}>
                                    ₹{categoryProfit.toLocaleString("en-IN")}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end">
                                    <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                                      <div 
                                        className="bg-green-600 h-2 rounded-full" 
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-600 min-w-[2.5rem]">
                                      {percentage}%
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        <tr className="bg-green-50 font-semibold border-t-2">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            Total Revenue
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-green-600">
                            ₹{totalSales.toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-900">
                            Avg: {sales.length > 0 ? (sales.reduce((sum, item) => sum + item.margin, 0) / sales.length).toFixed(1) : 0}%
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-green-600">
                            ₹{totalGrossProfit.toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-900">
                            100%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Expenses Table */}
              {Object.keys(expenses).length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
                    <h2 className="text-lg font-semibold text-gray-900">Expenses Breakdown</h2>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Category
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Share
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {expenseCategories
                          .filter(cat => expenses[cat.key] && expenses[cat.key] > 0)
                          .sort((a, b) => (expenses[b.key] || 0) - (expenses[a.key] || 0))
                          .map((category, index) => {
                            const amount = expenses[category.key];
                            const percentage = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0;
                            return (
                              <tr key={category.key} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <div className="flex items-center">
                                    <span className="text-lg mr-3">{category.icon}</span>
                                    <span className="text-sm font-medium text-gray-900">
                                      {category.label}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex flex-col items-end">
                                    <span className="text-sm font-semibold text-gray-900">
                                      ₹{(amount ).toLocaleString("en-IN")}
                                    </span>
                                
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end">
                                    <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                                      <div 
                                        className="bg-red-600 h-2 rounded-full" 
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-600 min-w-[2.5rem]">
                                      {percentage}%
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        <tr className="bg-gray-50 font-semibold border-t-2">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            Total Expenses
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-semibold text-gray-900">
                                ₹{(totalExpenses).toLocaleString("en-IN")}
                              </span>
                          
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-900">
                            100%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* No Data States */}
            {sales.length === 0 && Object.keys(expenses).length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No financial data found</h3>
                <p className="text-gray-500">No sales or expense data available for the selected period.</p>
              </div>
            )}
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