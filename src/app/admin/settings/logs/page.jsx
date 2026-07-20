"use client";

import { useEffect, useState } from "react";
import { ScrollText, Search, ChevronDown, AlertCircle, Activity, Clock, User, Database } from "lucide-react";
import { makeGet } from "@/lib/api";

// Helper function to get user-friendly target type names
const getTargetTypeName = (targetType) => {
  const typeNames = {
    'BoxSale': 'Daily Sale',
    'Hotel': 'Hotel',
    'User': 'User',
    'Category': 'Category',
    'Room': 'Room',
    'Booking': 'Booking'
  };
  return typeNames[targetType] || targetType;
};

// Helper function to format additional info for better readability
const formatAdditionalInfo = (info, targetType) => {
  if (!info) return null;
  
  const formatted = { ...info };
  
  // Add context-specific formatting
  if (targetType === 'BoxSale' && info.date) {
    formatted.sale_date = info.date;
    delete formatted.date;
  }
  
  if (info.items && Array.isArray(info.items)) {
    formatted.total_items = info.items.length;
    formatted.item_details = info.items;
    delete formatted.items;
  }
  
  return formatted;
};

const formatDate = (input) => {
  const date = new Date(input);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
};

const formatDateString = (input) => {
  const date = new Date(input);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getActionIcon = (action) => {
  const icons = {
    create: Database,
    update: Activity,
    delete: AlertCircle,
    view: Clock,
    login: User,
    logout: User
  };
  return icons[action?.toLowerCase()] || Activity;
};

const getActionColor = (action) => {
  const colors = {
    create: "bg-green-50 text-green-700 border-green-200",
    update: "bg-blue-50 text-blue-700 border-blue-200", 
    delete: "bg-red-50 text-red-700 border-red-200",
    view: "bg-purple-50 text-purple-700 border-purple-200",
    login: "bg-emerald-50 text-emerald-700 border-emerald-200",
    logout: "bg-gray-50 text-gray-700 border-gray-200"
  };
  return colors[action?.toLowerCase()] || "bg-gray-50 text-gray-700 border-gray-200";
};

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [actionTypes, setActionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [expandedLog, setExpandedLog] = useState(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalLogs, setTotalLogs] = useState(0);

  // Search Debouncer
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch Logic
  const fetchLogs = (pageNumber, searchVal, actionVal, isReset = false) => {
    if (isReset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    const params = new URLSearchParams({
      page: pageNumber,
      per_page: 50,
      search: searchVal,
      action: actionVal === 'all' ? '' : actionVal
    });

    makeGet(`/activity-logs?${params.toString()}`)
      .then((res) => {
        const paginatedData = res || {};
        const newLogs = paginatedData.data || [];
        const currentPage = paginatedData.current_page || 1;
        const lastPage = paginatedData.last_page || 1;

        if (isReset || currentPage === 1) {
          setLogs(newLogs);
        } else {
          setLogs((prev) => [...prev, ...newLogs]);
        }

        if (paginatedData.action_types) {
          setActionTypes(paginatedData.action_types);
        }

        setPage(currentPage);
        setHasMore(currentPage < lastPage);
        setTotalLogs(paginatedData.total || 0);
      })
      .catch((err) => {
        console.error("Failed to fetch logs", err);
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  };

  // Trigger fetch when search or filter changes
  useEffect(() => {
    fetchLogs(1, debouncedSearch, selectedFilter, true);
    setExpandedLog(null);
  }, [debouncedSearch, selectedFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-12">
      {/* Header Container */}
      <div className="shadow-sm rounded-2xl bg-white/80 backdrop-blur-lg border border-white/20 p-5 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <ScrollText className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Activity Logs</h1>
              <p className="text-sm text-gray-500 font-medium">{totalLogs} entries found</p>
            </div>
          </div>

          {/* Responsive Action Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedFilter === "all"
                  ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
              }`}
            >
              All Actions
            </button>
            {actionTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedFilter(type)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all duration-200 capitalize ${
                  selectedFilter === type
                    ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search logs by activity description, action, user or hotel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm md:text-base transition-all"
          />
        </div>
      </div>

      {/* Logs List Container */}
      <div className="space-y-4">
        {loading ? (
          // Skeleton Loader
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ScrollText className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No activity logs found</h3>
            <p className="text-gray-500 text-sm">
              {searchTerm || selectedFilter !== "all"
                ? "Try adjusting your search query or actions filter."
                : "Activity logs will show up here once actions are recorded."}
            </p>
          </div>
        ) : (
          // Logs Display
          <>
            <div className="space-y-3">
              {logs.map((log, index) => {
                const IconComponent = getActionIcon(log.action);
                const isExpanded = expandedLog === index;

                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-gray-200"
                  >
                    <div className="p-4 md:p-5">
                      <div className="flex items-start gap-3 md:gap-4">
                        {/* Left: Icon */}
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${getActionColor(log.action)}`}>
                          <IconComponent size={20} className="md:w-[22px] md:h-[22px]" />
                        </div>

                        {/* Right: Content block */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                            {/* Description & Metadata */}
                            <div className="space-y-1.5 md:space-y-2">
                              <p className="font-semibold text-gray-900 text-sm md:text-base leading-relaxed">
                                {log.description}
                              </p>
                              
                              {/* Badges and tags inline */}
                              <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-500">
                                <span className={`px-2 py-0.5 rounded-md font-semibold capitalize border ${getActionColor(log.action)}`}>
                                  {log.action}
                                </span>
                                {log.target_type && (
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-semibold">
                                    {getTargetTypeName(log.target_type)}
                                  </span>
                                )}
                                
                                {log.user?.name && (
                                  <span className="inline-flex items-center gap-1 font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                    <span>{log.user.role === 'admin' ? '👑' : '👤'}</span>
                                    <span>{log.user.name}</span>
                                  </span>
                                )}

                                <span className="inline-flex items-center gap-1 text-gray-400 font-medium ml-1">
                                  <Clock size={12} className="shrink-0" />
                                  <span>{formatDate(log.created_at)}</span>
                                </span>
                              </div>
                            </div>

                            {/* Action Trigger (Details / Expand) */}
                            {log.additional_info && (
                              <div className="self-end md:self-start pt-1 md:pt-0">
                                <button
                                  onClick={() => setExpandedLog(isExpanded ? null : index)}
                                  className="flex items-center gap-1 px-3 py-1 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 rounded-lg transition-all font-semibold border border-blue-100/50"
                                >
                                  <span>{isExpanded ? "Hide Details" : "Details"}</span>
                                  <ChevronDown
                                    size={13}
                                    className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                  />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded View */}
                      {log.additional_info && isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100 pl-0 md:pl-16">
                          <p className="text-xs md:text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                            <span>📋</span> Additional Information
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Key Values List */}
                            <div className="bg-gray-50/80 rounded-2xl p-4 space-y-2">
                              {Object.entries(formatAdditionalInfo(log.additional_info, log.target_type) || {}).map(([key, value]) => {
                                if (key === 'item_details' && Array.isArray(value)) {
                                  return (
                                    <div key={key} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                                      <p className="text-xs font-bold text-gray-700 mb-2 capitalize flex items-center gap-1.5">
                                        <span>📦</span> Items ({value.length})
                                      </p>
                                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {value.map((item, idx) => (
                                          <div key={idx} className="bg-gray-50 rounded-lg p-2.5 text-xs font-mono border border-gray-100">
                                            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                              <span className="text-gray-500">ID:</span>
                                              <span className="font-semibold text-gray-800">{item.id}</span>
                                              <span className="text-gray-500">Category:</span>
                                              <span className="font-semibold text-gray-800">{item.sales_category_id}</span>
                                              {item.amount !== undefined && (
                                                <>
                                                  <span className="text-gray-500">Amount:</span>
                                                  <span className="font-bold text-green-600 font-sans">₹{item.amount}</span>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                }

                                return (
                                  <div key={key} className="flex justify-between items-start gap-4 py-2 border-b border-gray-100 last:border-b-0">
                                    <span className="text-xs text-gray-500 capitalize font-bold shrink-0">
                                      {key.replace(/_/g, " ")}:
                                    </span>
                                    <span className="text-xs text-gray-800 font-mono font-medium text-right break-all max-w-[70%]" title={String(value)}>
                                      {typeof value === "object" ? JSON.stringify(value) : String(value)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Hotel Context */}
                            {log.user?.hotel && (
                              <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-4 flex flex-col justify-between">
                                <div>
                                  <p className="text-xs md:text-sm font-semibold text-blue-800 mb-3 flex items-center gap-1.5">
                                    <span>🏨</span> Hotel Context
                                  </p>
                                  <div className="space-y-2.5">
                                    <div className="flex justify-between items-center py-1.5 border-b border-blue-100/50">
                                      <span className="text-xs text-blue-600 font-semibold">Hotel Name:</span>
                                      <span className="text-xs text-blue-900 font-bold">{log.user.hotel.name}</span>
                                    </div>
                                    {log.user.hotel.city && (
                                      <div className="flex justify-between items-center py-1.5 border-b border-blue-100/50">
                                        <span className="text-xs text-blue-600 font-semibold">City:</span>
                                        <span className="text-xs text-blue-900 font-bold">{log.user.hotel.city}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between items-center py-1.5 border-b border-blue-100/50">
                                      <span className="text-xs text-blue-600 font-semibold">Hotel ID:</span>
                                      <span className="text-xs text-blue-900 font-mono font-bold">#{log.user.hotel.id}</span>
                                    </div>
                                    {log.user.hotel.hotel_type !== undefined && (
                                      <div className="flex justify-between items-center py-1.5">
                                        <span className="text-xs text-blue-600 font-semibold">Hotel Type:</span>
                                        <span className="text-xs text-blue-900 font-bold bg-blue-100/80 px-2.5 py-0.5 rounded-full">
                                          {log.user.hotel.hotel_type === 0 ? "Standard" : "Premium"}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => fetchLogs(page + 1, debouncedSearch, selectedFilter, false)}
                  disabled={loadingMore}
                  className="px-6 py-2.5 bg-white border border-gray-200 text-blue-600 rounded-xl font-bold shadow-sm hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}