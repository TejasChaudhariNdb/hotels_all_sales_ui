"use client"
import { useState, useEffect } from "react";
import { Calendar, TrendingUp, TrendingDown, Eye, Filter, Download, Plus, Building2, Users, ChevronDown, ChevronUp, Search, PieChart, BarChart3 } from "lucide-react";
import { makeGet } from "@/lib/api";

export default function AdminExpensesDashboard() {
  const [hotelExpenses, setHotelExpenses] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [networkBreakdown, setNetworkBreakdown] = useState(null);
  const [previousMonthData, setPreviousMonthData] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expandedHotel, setExpandedHotel] = useState(null);
  const [expandedBreakdown, setExpandedBreakdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('total'); // 'total', 'name'



  // Calculate network expense breakdown
  const calculateNetworkBreakdown = (hotels) => {
    const breakdown = {
      rent: 0,
      license_fee: 0,
      salary: 0,
      light_bill: 0,
      interest: 0,
      miscellaneous: 0
    };

    hotels.forEach(hotel => {
      breakdown.rent += hotel.expenses.rent;
      breakdown.license_fee += hotel.expenses.license_fee;
      breakdown.salary += hotel.expenses.salary;
      breakdown.light_bill += hotel.expenses.light_bill;
      breakdown.interest += hotel.expenses.interest;
      breakdown.miscellaneous += hotel.expenses.miscellaneous;
    });

    return breakdown;
  };

  // Fetch expenses data from API
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await makeGet('/admin/expenses', {
        year: selectedYear,
        month: selectedMonth
      });
      
      // Set summary data
      setSummaryData(data.summary);
      
      // Transform API data to match component structure
      if (data.hotels && data.hotels.length > 0) {
        const transformedData = data.hotels.map(hotel => ({
          id: hotel.hotel_id,
          name: hotel.hotel_name,
          location: hotel.hotel_city,
          totalExpenses: hotel.total_expenses,
          expenses: {
            rent: hotel.rent,
            license_fee: hotel.license_fee,
            salary: hotel.salary,
            light_bill: hotel.light_bill,
            interest: hotel.interest,
            miscellaneous: hotel.miscellaneous
          }
        }));
        setHotelExpenses(transformedData);
        
        // Calculate network breakdown
        const breakdown = calculateNetworkBreakdown(transformedData);
        setNetworkBreakdown(breakdown);
      } else {
        setHotelExpenses([]);
        setNetworkBreakdown(null);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setHotelExpenses([]);
      setSummaryData(null);
      setNetworkBreakdown(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch previous month data for comparison
  const fetchPrevMonthData = async () => {
    const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
    
    try {
      const prevData = await makeGet('/admin/expenses', {
        year: prevYear,
        month: prevMonth
      });
      
      if (prevData.hotels && prevData.hotels.length > 0) {
        // Create a map of hotel_id to total expenses for easy lookup
        const prevExpensesMap = {};
        prevData.hotels.forEach(hotel => {
          prevExpensesMap[hotel.hotel_id] = hotel.total_expenses;
        });
        setPreviousMonthData({
          hotelExpenses: prevExpensesMap,
          totalNetwork: prevData.summary?.total_network_expenses || 0
        });
      } else {
        setPreviousMonthData({ hotelExpenses: {}, totalNetwork: 0 });
      }
    } catch (err) {
      console.error('Error fetching previous month data:', err);
      setPreviousMonthData({ hotelExpenses: {}, totalNetwork: 0 });
    }
  };

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

  // Fetch data when component mounts or month/year changes
  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth, selectedYear]);

  // Fetch previous month data when current data changes
  useEffect(() => {
    if (hotelExpenses.length > 0) {
      fetchPrevMonthData();
    }
  }, [selectedMonth, selectedYear, hotelExpenses.length]);

  // Filter and sort hotels
  const filteredAndSortedHotels = hotelExpenses
    .filter(hotel => 
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'total') {
        return b.totalExpenses - a.totalExpenses;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  // Calculate overall change percentage
  const currentTotal = summaryData?.total_network_expenses || 0;
  const previousTotal = previousMonthData?.totalNetwork || 0;
  const overallChange = previousTotal ? ((currentTotal - previousTotal) / previousTotal * 100) : 0;

  // Helper function to get percentage change for individual hotel
  const getHotelPercentageChange = (hotelId, currentExpenses) => {
    const previousExpenses = previousMonthData?.hotelExpenses?.[hotelId] || 0;
    if (previousExpenses === 0) return 0;
    return ((currentExpenses - previousExpenses) / previousExpenses * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Hotel Expenses Overview</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <Download className="w-5 h-5 text-white" />
            </button>
            <button className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        
        {/* Month/Year Selector */}
        <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 mb-4">
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
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
            </div>
          </div>
        </div>

        {/* Overall Summary */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 shadow-lg text-white mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold opacity-90">Total Network Expenses</h2>
              <p className="text-3xl font-bold">₹{(summaryData?.total_network_expenses || 0).toLocaleString("en-IN")}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end mb-1">
                {overallChange > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : overallChange < 0 ? (
                  <TrendingDown className="w-4 h-4" />
                ) : null}
                <span className="text-sm font-medium">
                  {overallChange !== 0 ? `${Math.abs(overallChange).toFixed(1)}%` : 'No data'}
                </span>
              </div>
              <p className="text-sm opacity-75">{summaryData?.total_hotels || 0} Hotels</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-2xl font-bold">{summaryData?.total_hotels || 0}</p>
              <p className="text-xs opacity-75">Active Hotels</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">₹{((summaryData?.average_per_hotel || 0) / 1000).toFixed(0)}K</p>
              <p className="text-xs opacity-75">Avg per Hotel</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{previousTotal ? (overallChange > 0 ? '+' : '') + overallChange.toFixed(1) + '%' : 'N/A'}</p>
              <p className="text-xs opacity-75">vs Last Month</p>
            </div>
          </div>
        </div>

        {/* Network Expense Breakdown Card */}
        {!loading && networkBreakdown && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-4">
            <div 
              className="p-5 cursor-pointer"
              onClick={() => setExpandedBreakdown(!expandedBreakdown)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <PieChart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg"> Breakdown</h3>
                    <p className="text-sm text-gray-500">All {summaryData?.total_hotels || 0} hotels combined</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <p className="text-lg font-bold text-gray-900">₹{(summaryData?.total_network_expenses || 0).toLocaleString("en-IN")}</p>
                    <p className="text-xs text-gray-500">Total Network</p>
                  </div>
                  
                  {expandedBreakdown ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Top 3 Categories Preview */}
              {!expandedBreakdown && (
                <div className="flex items-center gap-4 text-sm">
                  {expenseCategories
                    .map(cat => ({
                      ...cat,
                      amount: networkBreakdown[cat.key],
                      percentage: (networkBreakdown[cat.key] / (summaryData?.total_network_expenses || 1)) * 100
                    }))
                    .sort((a, b) => b.amount - a.amount)
                    .slice(0, 3)
                    .map((cat, index) => (
                      <div key={cat.key} className="flex items-center gap-2">
                        <div className={`w-3 h-3 ${cat.color} rounded-full`}></div>
                        <span className="text-gray-600">
                          {cat.label}: {cat.percentage.toFixed(1)}%
                        </span>
                        {index < 2 && <div className="w-1 h-1 bg-gray-300 rounded-full"></div>}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Expanded Network Breakdown */}
            {expandedBreakdown && (
              <div className="border-t border-gray-100">
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Detailed Breakdown</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <BarChart3 className="w-4 h-4" />
                      <span>Network totals</span>
                    </div>
                  </div>
                  
                  {expenseCategories
                    .map(category => ({
                      ...category,
                      amount: networkBreakdown[category.key],
                      percentage: (networkBreakdown[category.key] / (summaryData?.total_network_expenses || 1)) * 100
                    }))
                    .sort((a, b) => b.amount - a.amount)
                    .map((category) => {
                      const maxAmount = Math.max(...Object.values(networkBreakdown));
                      const barWidth = (category.amount / maxAmount) * 100;
                      
                      return (
                        <div key={category.key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center text-white text-sm`}>
                                {category.icon}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{category.label}</p>
                                <p className="text-xs text-gray-500">{category.percentage.toFixed(1)}% of total</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">₹{category.amount.toLocaleString('en-IN')}</p>
                              <p className="text-xs text-gray-500">₹{Math.round(category.amount / (summaryData?.total_hotels || 1) / 1000)}K avg</p>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                              className={`${category.color} h-2 rounded-full transition-all duration-500 ease-out`}
                              style={{ width: `${barWidth}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}

                  {/* Network Insights */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <h5 className="font-medium text-gray-900 mb-2">Quick Insights</h5>
                    <div className="space-y-2 text-sm text-gray-600">
                      {(() => {
                        const sortedCategories = expenseCategories
                          .map(cat => ({ ...cat, amount: networkBreakdown[cat.key] }))
                          .sort((a, b) => b.amount - a.amount);
                        const topCategory = sortedCategories[0];
                        const lowestCategory = sortedCategories[sortedCategories.length - 1];
                        
                        return (
                          <>
                            <p>• Highest expense: <span className="font-medium">{topCategory.label}</span> (₹{Math.round(topCategory.amount / 100000)}L)</p>
                            <p>• Average per hotel: <span className="font-medium">₹{Math.round((summaryData?.average_per_hotel || 0) / 1000)}K</span></p>
                            <p>• Lowest category: <span className="font-medium">{lowestCategory.label}</span> (₹{Math.round(lowestCategory.amount / 100000)}L)</p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search hotels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="total">Sort by Total</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expenses data...</p>
        </div>
      )}

      {/* Hotels List */}
      {!loading && (
        <div className="space-y-4">
          {filteredAndSortedHotels.map((hotel) => {
            const percentageChange = getHotelPercentageChange(hotel.id, hotel.totalExpenses);
            const isExpanded = expandedHotel === hotel.id;

            return (
              <div key={hotel.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                {/* Hotel Header */}
                <div 
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedHotel(isExpanded ? null : hotel.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{hotel.name}</h3>
                        <p className="text-sm text-gray-500">{hotel.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-2">
                        <p className="text-lg font-bold text-gray-900">₹{hotel.totalExpenses.toLocaleString("en-IN")}</p>
                        <div className="flex items-center gap-1 justify-end">
                          {percentageChange > 0 ? (
                            <TrendingUp className="w-3 h-3 text-red-500" />
                          ) : percentageChange < 0 ? (
                            <TrendingDown className="w-3 h-3 text-green-500" />
                          ) : null}
                          <span className={`text-xs font-medium ${
                            percentageChange > 0 ? "text-red-600" : 
                            percentageChange < 0 ? "text-green-600" : "text-gray-500"
                          }`}>
                            {percentageChange !== 0 ? `${Math.abs(percentageChange).toFixed(1)}%` : 'No data'}
                          </span>
                        </div>
                      </div>
                      
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      {months[selectedMonth - 1]} {selectedYear} expenses
                    </span>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span className="text-gray-600">
                      Total: ₹{Math.round(hotel.totalExpenses / 1000)}K
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    <div className="p-5 space-y-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Expense Breakdown</h4>
                      
                      {expenseCategories.map((category) => {
                        const amount = hotel.expenses[category.key] || 0;
                        const percentage = hotel.totalExpenses ? (amount / hotel.totalExpenses * 100) : 0;
                        
                        return (
                          <div key={category.key} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center text-white text-sm`}>
                                {category.icon}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{category.label}</p>
                                <p className="text-xs text-gray-500">{percentage.toFixed(1)}% of total</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">₹{amount.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        );
                      })}
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
      )}

      {!loading && filteredAndSortedHotels.length === 0 && (
        <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Hotels Found</h3>
          <p className="text-gray-600 text-sm">
            {searchQuery ? 'No hotels match your search criteria' : 'No expense data available for this period'}
          </p>
        </div>
      )}
    </div>
  );
}