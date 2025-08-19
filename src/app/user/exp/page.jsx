"use client"
import { useState, useEffect } from "react";
import { Calendar, TrendingUp, TrendingDown, Eye, Filter, Download, Plus } from "lucide-react";

import { makeGet } from "@/lib/api";
import { useRouter } from "next/navigation";
export default function ExpensesDashboard() {
  const [expenses, setExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  // Fetch expenses data
  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await makeGet('/expenses', {
        year: selectedYear,
        month: selectedMonth
      });
      setExpenses(data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth, selectedYear]);

  const expenseCategories = [
    { key: "rent", label: "Rent", icon: "🏢", color: "bg-blue-500" },
    { key: "license_fee", label: "License Fee", icon: "📋", color: "bg-purple-500" },
    { key: "salary", label: "Salary", icon: "👥", color: "bg-green-500" },
    { key: "light_bill", label: "Electricity", icon: "💡", color: "bg-yellow-500" },
    { key: "interest", label: "Interest", icon: "📈", color: "bg-red-500" },
    { key: "miscellaneous", label: "Miscellaneous", icon: "📦", color: "bg-gray-500" },
  ];

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentMonthData = expenses && Object.keys(expenses).length > 0 ? expenses : null;

  console.log(expenses)
  const totalExpenses = currentMonthData
  ? expenseCategories.reduce((sum, cat) => sum + (currentMonthData[cat.key] || 0), 0)
  : 0;

  // Calculate previous month for comparison
  const fetchPrevMonthData = async () => {
    const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
    
    try {
      const prevData = await makeGet('/expenses', {
        year: prevYear,
        month: prevMonth
      });
      return prevData;
    } catch (err) {
      console.error('Error fetching previous month data:', err);
      return null;
    }
  };

  const [prevMonthData, setPrevMonthData] = useState(null);

  useEffect(() => {
    const loadPrevData = async () => {
      const prevData = await fetchPrevMonthData();
      setPrevMonthData(prevData);
    };
    
    if (currentMonthData) {
      loadPrevData();
    }
  }, [currentMonthData, selectedMonth, selectedYear]);
 
  const prevTotal = prevMonthData
  ? expenseCategories.reduce((sum, cat) => sum + (prevMonthData[cat.key] || 0), 0)
  : 0;

console.log(prevTotal)
  const percentageChange = prevTotal ? ((totalExpenses - prevTotal) / prevTotal * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <button 
            onClick={fetchExpenses}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all active:scale-95"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Expenses Dashboard 
          </h1>
          
          <button className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"   onClick={() => {
              // Navigate to expense form or trigger modal
              router.push("exp/add")
            }}>
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
        
        {/* Month/Year Selector */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div className="flex gap-2 flex-1">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="flex-1 bg-gray-50 rounded-xl border-0 px-3 py-2 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
              >
                {months.map((month, i) => (
                  <option key={i + 1} value={i + 1}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-gray-50 rounded-xl border-0 px-3 py-2 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
              >
    
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
            </div>
          </div>
        </div>

     {/* Total Summary Card */}
<div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-base font-semibold text-gray-800">Total Expenses</h2>
    <button
      onClick={() =>
        router.push(`/user/exp/edit?month=${selectedMonth}&year=${selectedYear}`)
      }
      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
    >
      Edit
    </button>
  </div>

  <div className="flex items-center justify-between">
    <p className="text-2xl font-bold text-gray-900">
      ₹{totalExpenses.toLocaleString("en-IN")}
    </p>
    <div className="flex items-center gap-1">
      {percentageChange > 0 ? (
        <TrendingUp className="w-4 h-4 text-green-500" />
      ) : (
        <TrendingDown className="w-4 h-4 text-red-500" />
      )}
      <span
        className={`text-sm font-medium ${
          percentageChange > 0 ? "text-green-600" : "text-red-600"
        }`}
      >
        {Math.abs(percentageChange).toFixed(1)}%
      </span>
    </div>
  </div>

  <p className="text-sm text-gray-500 mt-1">
    {months[selectedMonth - 1]} {selectedYear}
  </p>
</div>

      </div>

      {/* View Toggle */}
      <div className="flex bg-white rounded-2xl p-1 shadow-lg border border-gray-100 mb-6">
        <button
          onClick={() => setViewMode('cards')}
          className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
            viewMode === 'cards' 
              ? 'bg-blue-500 text-white shadow-md' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Cards View
        </button>
        <button
          onClick={() => setViewMode('table')}
          className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
            viewMode === 'table' 
              ? 'bg-blue-500 text-white shadow-md' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Table View
        </button>
      </div>

      {/* Content */}
      {!currentMonthData ? (
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Found</h3>
          <p className="text-gray-600 text-sm mb-6">
            No expenses recorded for {months[selectedMonth - 1]} {selectedYear}
          </p>
          <button 
            onClick={() => {
              // Navigate to expense form or trigger modal
              router.push("exp/add")
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add Expenses
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Cards View */
        <div className="space-y-4">
          {expenseCategories.map((category) => {
            const amount = currentMonthData[category.key] || 0;
            const percentage = totalExpenses ? (amount / totalExpenses * 100) : 0;
            return (
              <div key={category.key} className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${category.color} rounded-xl flex items-center justify-center text-white text-lg`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.label}</h3>
                      <p className="text-xs text-gray-500">{percentage.toFixed(1)}% of total</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">₹{amount.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${category.color}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Expense Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Category</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Amount</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">%</th>
                </tr>
              </thead>
              <tbody>
                {expenseCategories.map((category, index) => {
                  const amount = currentMonthData[category.key] || 0;
                  const percentage = totalExpenses ? (amount / totalExpenses * 100) : 0;
                  return (
                    <tr key={category.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium text-gray-900">{category.label}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        ₹{amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {percentage.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-blue-50 border-t-2 border-blue-200">
                <tr>
                  <td className="py-3 px-4 font-bold text-gray-900">Total</td>
                  <td className="py-3 px-4 text-right font-bold text-blue-600">
                    ₹{totalExpenses.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}