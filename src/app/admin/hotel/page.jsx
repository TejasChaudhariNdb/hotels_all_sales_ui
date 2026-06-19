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
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-xl mb-4">
        <div className="px-5 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{hotelName}</h1>
              {dateRange && (
                <p className="text-sm text-slate-500 font-medium mt-1">{dateRange}</p>
              )}
              {meta.selected_days && (
                <p className="text-xs text-slate-400 mt-1">
                  {meta.selected_days} of {meta.days_in_month} days selected
                </p>
              )}
            </div>
            <div className={`text-right px-4 py-2 rounded-xl ${netProfit >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Profit</p>
              <p className={`text-xl font-extrabold mt-0.5 ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                ₹{netProfit.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin h-6 w-6 text-slate-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span className="ml-3 text-sm font-semibold text-slate-500">Loading financial data...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sales</p>
                    <p className="text-lg font-extrabold text-emerald-600">
                      ₹{totalSales.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Profit</p>
                    <p className="text-lg font-extrabold text-slate-700">
                      ₹{totalGrossProfit.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-50 rounded-lg">
                    <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expenses</p>
                    <p className="text-lg font-extrabold text-rose-600">
                      ₹{(totalExpenses).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Categories</p>
                    <p className="text-lg font-extrabold text-slate-800">{sales.length}</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl shadow-sm p-4 ${netProfit >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${netProfit >= 0 ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                    <svg className={`w-5 h-5 ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Profit</p>
                    <p className={`text-lg font-extrabold ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      ₹{netProfit.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales and Expenses Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Sales Table */}
              {sales.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 bg-emerald-50/50">
                    <h2 className="text-sm font-bold text-slate-800">Revenue by Category</h2>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Sales</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Margin</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Profit</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Share</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {sales
                          .sort((a, b) => b.amount - a.amount)
                          .map((item, index) => {
                            const percentage = ((item.amount / totalSales) * 100).toFixed(1);
                            const categoryProfit = (item.amount * item.margin) / 100;
                            return (
                              <tr key={item.category_id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                      index === 0 ? 'bg-emerald-500' :
                                      index === 1 ? 'bg-slate-500' :
                                      index === 2 ? 'bg-violet-500' :
                                      'bg-slate-300'
                                    }`}></span>
                                    <span className="text-sm font-medium text-slate-800">
                                      {item.category_name}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="text-sm font-bold text-slate-900">
                                    ₹{item.amount.toLocaleString("en-IN")}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                    item.margin > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {item.margin}%
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className={`text-sm font-semibold ${
                                    categoryProfit > 0 ? 'text-emerald-600' : 'text-slate-400'
                                  }`}>
                                    ₹{categoryProfit.toLocaleString("en-IN")}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <div className="w-12 bg-slate-100 rounded-full h-1.5">
                                      <div
                                        className="bg-slate-600 h-1.5 rounded-full"
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-500 min-w-[2.5rem] text-right">
                                      {percentage}%
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        <tr className="bg-slate-800 font-semibold">
                          <td className="px-4 py-3 text-sm font-bold text-white">Total Revenue</td>
                          <td className="px-4 py-3 text-right text-sm font-bold text-emerald-400">₹{totalSales.toLocaleString("en-IN")}</td>
                          <td className="px-4 py-3 text-right text-sm text-slate-300">
                            Avg: {sales.length > 0 ? (sales.reduce((sum, item) => sum + item.margin, 0) / sales.length).toFixed(1) : 0}%
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-bold text-emerald-400">₹{totalGrossProfit.toLocaleString("en-IN")}</td>
                          <td className="px-4 py-3 text-right text-sm text-slate-300">100%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Expenses Table */}
              {Object.keys(expenses).length > 0 && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 bg-rose-50/50">
                    <h2 className="text-sm font-bold text-slate-800">Expenses Breakdown</h2>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Share</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {expenseCategories
                          .filter(cat => expenses[cat.key] && expenses[cat.key] > 0)
                          .sort((a, b) => (expenses[b.key] || 0) - (expenses[a.key] || 0))
                          .map((category, index) => {
                            const amount = expenses[category.key];
                            const percentage = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0;
                            return (
                              <tr key={category.key} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">{category.icon}</span>
                                    <span className="text-sm font-medium text-slate-800">{category.label}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="text-sm font-bold text-slate-900">
                                    ₹{(amount).toLocaleString("en-IN")}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <div className="w-12 bg-slate-100 rounded-full h-1.5">
                                      <div
                                        className="bg-rose-500 h-1.5 rounded-full"
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-500 min-w-[2.5rem] text-right">{percentage}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        <tr className="bg-slate-800">
                          <td className="px-4 py-3 text-sm font-bold text-white">Total Expenses</td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-bold text-rose-400">
                              ₹{(totalExpenses).toLocaleString("en-IN")}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-bold text-slate-300">100%</td>
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
                <div className="w-14 h-14 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-700 mb-1">No financial data found</h3>
                <p className="text-sm text-slate-400">No sales or expense data available for the selected period.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelCategorySalesPage;