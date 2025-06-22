"use client";

import { useEffect, useState } from "react";
import { ScrollText, Search, Filter, Calendar, ChevronDown, AlertCircle, Activity, Clock, User, Database } from "lucide-react";
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
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [expandedLog, setExpandedLog] = useState(null);

  useEffect(() => {
    // Your actual API call - remove the mock data above when using this
    makeGet("/activity-logs")
      .then((res) => {
        const logData = res.data || res;
        setLogs(logData);
        setFilteredLogs(logData);
      })
      .catch((err) => {
        console.error("Failed to fetch logs", err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = logs;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply action filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter(log => log.action?.toLowerCase() === selectedFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, selectedFilter]);

  const actionTypes = [...new Set(logs.map(log => log.action?.toLowerCase()).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="border-b border-gray-100 pb-4 mb-4 last:border-b-0 last:mb-0">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="  shadow-sm rounded-xl bg-white/80 backdrop-blur-lg border-b border-white/20 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <ScrollText className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Activity Logs</h1>
              <p className="text-sm text-gray-500">{filteredLogs.length} entries</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedFilter === "all"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            {actionTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedFilter(type)}
                className={`px-4 py-2  shadow-sm rounded-lg text-sm font-medium whitespace-nowrap transition-all capitalize ${
                  selectedFilter === type
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-5 p-2 pb-8">
        <div className="max-w-md mx-auto">
          {filteredLogs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ScrollText className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No logs found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedFilter !== "all" 
                  ? "Try adjusting your search or filter"
                  : "Activity logs will appear here"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log, index) => {
                const IconComponent = getActionIcon(log.action);
                const isExpanded = expandedLog === index;
                
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${getActionColor(log.action)}`}>
                          <IconComponent size={18} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {/* Main description */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <p className="font-medium text-gray-900 text-sm leading-relaxed flex-1">
                              {log.description}
                            </p>
                            
                            {log.additional_info && (
                              <button
                                onClick={() => setExpandedLog(isExpanded ? null : index)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                              >
                                <ChevronDown 
                                  size={16} 
                                  className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                />
                              </button>
                            )}
                          </div>
                          
                          {/* Action and target type badges */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getActionColor(log.action)}`}>
                              {log.action}
                            </span>
                            
                            {log.target_type && (
                              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                {getTargetTypeName(log.target_type)}
                              </span>
                            )}

{log.additional_info && (
                            <div className="flex items-center  ">
                      
                              {log.additional_info.items && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm">📦</span>
                                  <span className="text-xs text-gray-600 font-medium">{log.additional_info.items.length} items</span>
                                </div>
                              )}
                            </div>
                          )}
                          </div>
                          
                          {/* User info and timestamp */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {log.user?.name && (
                                <div className="flex items-center gap-1.5 text-blue-600">
                                  <span className="text-sm">{log.user.role === 'user' ? '👤' : '👑'}</span>
                                  <span className="text-xs font-medium">{log.user.name}</span>
                                </div>
                              )}
                            </div>
                            
                            <span className="text-xs text-gray-500 font-medium">
                              {formatDate(log.created_at)}
                            </span>
                          </div>
                          
                          {/* Quick info preview */}
                          {log.additional_info && (
                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                              {log.additional_info.hotel_id && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm">🏨</span>
                                  <span className="text-xs text-gray-600 font-medium">{log.user.hotel.name}</span>
                                </div>
                              )}
                              {log.additional_info.date && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm">📅</span>
                                  <span className="text-xs text-gray-600 font-medium">{formatDateString(log.additional_info.date)}</span>
                                </div>
                              )}
                      
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {log.additional_info && isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-xs font-medium text-gray-700 mb-3">📋 Additional Details</p>
                          <div className="space-y-3">
                            
                            {/* Formatted key-value pairs */}
                            {Object.entries(formatAdditionalInfo(log.additional_info, log.target_type) || {}).map(([key, value]) => {
                              if (key === 'item_details' && Array.isArray(value)) {
                                return (
                                  <div key={key} className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xs font-medium text-gray-700 mb-2 capitalize">
                                      📦 Items ({value.length})
                                    </p>
                                    <div className="space-y-2">
                                      {value.map((item, idx) => (
                                        <div key={idx} className="bg-white rounded-lg p-2 text-xs">
                                          <div className="grid grid-cols-2 gap-2">
                                            <span className="text-gray-500">ID:</span>
                                            <span className="font-mono">{item.id}</span>
                                            <span className="text-gray-500">Category:</span>
                                            <span className="font-mono">{item.sales_category_id}</span>
                                            {item.amount && (
                                              <>
                                                <span className="text-gray-500">Amount:</span>
                                                <span className="font-mono">{item.amount}</span>
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
                                <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                  <span className="text-xs text-gray-500 capitalize font-medium">
                                    {key.replace(/_/g, ' ')}:
                                  </span>
                                  <span className="text-xs text-gray-700 font-mono max-w-32 truncate">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              );
                            })}
                            
                                {/* Hotel information section */}
                                {log.user?.hotel && (
                              <div className="bg-blue-50 rounded-xl p-3 mt-3">
                                <p className="text-xs font-medium text-blue-700 mb-2">🏨 Hotel Information</p>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">Name:</span>
                                    <span className="text-xs text-gray-800 font-medium">{log.user.hotel.name}</span>
                                  </div>
                                  {log.user.hotel.city && (
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-gray-600">City:</span>
                                      <span className="text-xs text-gray-800 font-medium">{log.user.hotel.city}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">Hotel ID:</span>
                                    <span className="text-xs text-gray-800 font-mono">#{log.user.hotel.id}</span>
                                  </div>
                                  {log.user.hotel.hotel_type !== undefined && (
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-gray-600">Type:</span>
                                      <span className="text-xs text-gray-800 font-medium">
                                        {log.user.hotel.hotel_type === 0 ? 'Standard' : 'Premium'}
                                      </span>
                                    </div>
                                  )}
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
          )}
        </div>
      </div>
    </div>
  );
}