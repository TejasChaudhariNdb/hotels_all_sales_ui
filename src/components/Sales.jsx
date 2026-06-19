"use client";
import { useEffect, useState } from "react";
import { makeGet ,makeDelete} from "@/lib/api";
import {
  Search,
  Download,
  Calendar,
  ChevronDown,
  ChevronUp,
  Box,
  CalendarIcon,
  CopyXIcon,
  Trash2,
  XCircle
} from "lucide-react";


import SalesFilter from "@/components/SalesFilter";
import Link from "next/link";
export default function SalesPage({role,hotel_type}) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [selectedSalesCategories, setSelectedSalesCategories] = useState([]);
  const [visibleDeleteGroup, setVisibleDeleteGroup] = useState(null);
  let longPressTimer = null;
  useEffect(() => {

    fetchSales();
  }, []);

  useEffect(() => {
    if (visibleDeleteGroup) {
      const timer = setTimeout(() => {
        setVisibleDeleteGroup(null);
      }, 5000); // hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [visibleDeleteGroup]);
  

  const fetchSales = async () => {

    try {
      setLoading(true);
      const res = await makeGet(`${hotel_type === 0 ? "/daily-sales" : "/boxes-sales"}`, {
        start_date: fromDate,
        end_date: toDate,
      });

      let salesData = res.data || [];

      if (hotel_type === 1) {
        salesData = convertBoxSalesToDailySalesFormat(salesData);
      }

      setSales(salesData);
    } catch (err) {
      console.error("Failed to load sales", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    return new Date(dateStr).toLocaleDateString("en-IN", options);
  };

  const getFilteredAndGroupedSales = () => {
    const grouped = {};

    sales.forEach((sale) => {
      // Composite key: hotel ID + date
      const key = `${sale.hotel_id}-${sale.date}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(sale);
    });

    return Object.entries(grouped)
      .sort(([keyA], [keyB]) => {
        // Extract date part from key "hotelId-date"
        const dateA = keyA.split("-")[1];
        const dateB = keyB.split("-")[1];
        return new Date(dateB) - new Date(dateA);
      })
      .map(([key, entries]) => {
        // All sales in entries are for the same hotel and date
        const items = entries.flatMap((e) => e.items);
        const filteredItems = items.filter((item) =>
          item.sales_category?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
        const total = filteredItems.reduce(
          (sum, item) => sum + parseFloat(item.amount),
          0
        );

        // Use first sale's hotel info (assuming all have same hotel)
        const hotel = entries[0].hotel || { id: entries[0].hotel_id, name: "Unknown Hotel" };
        const is_closed = entries[0].is_closed || false; 
        // Use date from one of the entries
        const date = entries[0].date;
        const sale_id = entries[0].id;
        return {
          sale_id,
          date,
          is_closed,
          formattedDate: formatDate(date),
          items: filteredItems,
          hotel,
          total,
        };
      })
      .filter((group) => group.items.length > 0);
  };


  const groupedSales = getFilteredAndGroupedSales();
  const grandTotal = groupedSales.reduce((sum, group) => sum + group.total, 0);

  const exportToCSV = () => {
    const rows = [["Date", "Category", "Amount"]];

    groupedSales.forEach((group) => {
      group.items.forEach((item) => {
        rows.push([
          group.formattedDate,
          item.sales_category?.name || "N/A",
          item.amount,
        ]);
      });
      rows.push(["", `Total`, group.total.toFixed(2)]);
    });

    rows.push(["", "Grand Total", grandTotal.toFixed(2)]);

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatINRCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);



    const handleFilter = ({ cities, categories, hotels,salesCategory }) => {
      try {
        setSelectedCities(cities);
        setSelectedCategories(categories);
        setSelectedHotels(hotels);
        setSelectedSalesCategories(salesCategory);
      setLoading(true);
      const query = new URLSearchParams();

      cities?.forEach((id) => query.append("city_ids[]", id));
      categories?.forEach((id) => query.append("category_ids[]", id));
      hotels?.forEach((id) => query.append("hotel_ids[]", id));
      salesCategory?.forEach((id) => query.append("sales_catogory_ids[]", id));

      // If you have start_date or end_date, add them here too
      query.append("start_date", fromDate);
      query.append("end_date", toDate);


      // Make the GET request
      makeGet(`${hotel_type === 0 ? "/daily-sales" : "/boxes-sales"}?${query.toString()}`)
        .then((res) => {
          console.log("Filtered sales data:", res);
  
      let salesData = res.data || [];

      if (hotel_type === 1) {
        // Assuming you already have this salesCategories list loaded somewhere in your app
        // If not, you need to fetch it first from your API and store it (e.g. /sales-categories)
        salesData = convertBoxSalesToDailySalesFormat(salesData);
      }

      setSales(salesData);


        })
        .catch((err) => {
          console.error("Error fetching filtered sales:", err);
        });


      } catch (err) {
        console.error("Failed to load sales", err);
      } finally {
        setLoading(false);
      }
    };

    const applyDateFilter = ()  => {
      setIsDateFilterOpen(false)
      handleFilter({
        cities: selectedCities,
        categories: selectedCategories,
        hotels: selectedHotels,
        salesCategory:selectedSalesCategories
      });
    }

    function convertBoxSalesToDailySalesFormat(boxSalesResponse) {
      return boxSalesResponse.map(boxSale => ({
        ...boxSale,
        // Format date same way
        date: new Date(boxSale.date).toISOString(),
        items: boxSale.items.map(item => ({
          id: item.id,
          daily_sale_id: item.box_sale_id,
          sales_category_id: item.sales_category_id,
          amount: item.quantity.toString(), // quantity => amount as string
          created_at: item.created_at,
          updated_at: item.updated_at,
          // If you don't have sales_category object inside item, you can omit or fill with placeholders
          sales_category: item.sales_category || {
            id: item.sales_category_id,
            name: 'Unknown',
            category_type_id: null,
            created_at: null,
            updated_at: null,
          },
        })),
      }));
    }
    
    
    const handleDeleteGroup = async (group) => {
      console.log(group)
      const confirmed = confirm(
        `Are you sure you want to delete sales for ${group.hotel.name} on ${group.formattedDate}?`
      );
    
      if (!confirmed) return;
    
      try {
        // Assuming group has a unique `id` (sale group ID)
        const endpoint = hotel_type === 0 ? `/daily-sales/${group.sale_id}` : `/boxes-sales/${group.sale_id}`;
        await makeDelete(endpoint);

    
        fetchSales(); // Refresh list after deletion
      } catch (err) {
        console.error("Failed to delete sales group", err);
        alert("Failed to delete sales group.");
      }
    };
    
    

  return (
    <div className="w-full max-w-7xl mx-auto p-3 md:p-6 transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h1 className="text-lg font-bold text-slate-800 flex items-center tracking-tight">
          <div className="p-1.5 bg-slate-100 rounded-lg mr-2 text-slate-700">
            <Calendar size={16} />
          </div>
          <span>{hotel_type === 0 ? "Sales Records" : "Boxes Sales Records"}</span>
        </h1>
        <div className="flex items-center gap-2">
          {role === "admin" && <SalesFilter onApplyFilter={handleFilter} hotel_type={hotel_type} />}
          <button
            onClick={exportToCSV}
            className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg flex items-center justify-center text-xs font-semibold shadow-sm active:scale-95 transition-all duration-200 h-9"
          >
            <Download size={13} className="mr-1.5" />
            <span>Export CSV</span>
          </button>

          {role === "admin" && (
            <Link href={`/admin/noEntry?start=${fromDate}&todate=${toDate}`} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-sm flex items-center justify-center h-9 w-9 text-rose-500">
              <CopyXIcon size={16} />
            </Link>
          )}

          {role === "user" && (
            <Link href={`/user/noEntry?start=${fromDate}&todate=${toDate}`} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-sm flex items-center justify-center h-9 w-9 text-rose-500">
              <CopyXIcon size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* Date Filter & Search Input Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5 z-20 relative">
        {/* Date Filter */}
        <div className="relative">
          <button
            onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
            className="w-full flex items-center justify-between bg-white hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg shadow-sm focus:outline-none font-semibold text-xs text-slate-700 transition-all h-9"
            aria-expanded={isDateFilterOpen}
            aria-label={isDateFilterOpen ? "Close date filter" : "Open date filter"}
          >
            <div className="flex items-center gap-2">
              <CalendarIcon size={14} className="text-slate-400" />
              <span>
                {fromDate === toDate
                  ? formatDate(fromDate)
                  : `${formatDate(fromDate)} - ${formatDate(toDate)}`}
              </span>
            </div>
            {isDateFilterOpen ? (
              <ChevronUp className="text-slate-500" size={14} />
            ) : (
              <ChevronDown className="text-slate-500" size={14} />
            )}
          </button>

          {/* Absolute Dropdown */}
          <div
            className={`absolute left-0 right-0 z-30 mt-1.5 bg-white rounded-lg shadow-xl p-4 border border-slate-200 transition-all duration-300 overflow-hidden ${
              isDateFilterOpen ? "max-h-[500px] opacity-100 visible" : "max-h-0 opacity-0 invisible pointer-events-none"
            }`}
          >
            {/* Shortcut Buttons */}
            <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar whitespace-nowrap pb-1">
              {[
                { label: "Today", offset: 0 },
                { label: "Yesterday", offset: -1 },
                { label: "This Week", type: "week" },
                { label: "Last Week", type: "lastweek" },
                { label: "This Month", type: "month" },
                { label: "Last Month", type: "lastmonth" },
              ].map((btn, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const today = new Date();
                    let from, to;

                    if (btn.offset !== undefined) {
                      const date = new Date(today);
                      date.setDate(today.getDate() + btn.offset);
                      from = to = date.toISOString().split('T')[0];
                    } else {
                      if (btn.type === "week") {
                        const day = today.getDay();
                        from = new Date(today);
                        from.setDate(today.getDate() - day + 1); // Monday
                        to = new Date(from);
                        to.setDate(from.getDate() + 6);
                        if (to > today) to = today;
                      } else if (btn.type === "lastweek") {
                        const day = today.getDay();
                        to = new Date(today);
                        to.setDate(today.getDate() - day);
                        from = new Date(to);
                        from.setDate(to.getDate() - 6);
                      } else if (btn.type === "month") {
                        from = new Date(today.getFullYear(), today.getMonth(), 1);
                        to = today;
                      } else if (btn.type === "lastmonth") {
                        const year = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
                        const month = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
                        from = new Date(year, month, 1);
                        to = new Date(year, month + 1, 0);
                      }

                      from = from.toISOString().split('T')[0];
                      to = to.toISOString().split('T')[0];
                    }

                    setFromDate(from);
                    setToDate(to);
                  }}
                  className="px-2.5 py-1.5 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 rounded-md active:scale-95 transition-all text-slate-600"
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Date Inputs */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  From
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="text-black w-full rounded-md border border-slate-200 p-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  To
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="text-black w-full rounded-md border border-slate-200 p-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all"
                />
              </div>
            </div>

            <button
              onClick={applyDateFilter}
              className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2 rounded-lg transition-all w-full active:scale-95 shadow-md text-xs h-9"
            >
              Apply Date Filter
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            size={14}
          />
          <input
            type="text"
            placeholder="Search by category name..."
            className="text-black bg-slate-50 border border-slate-200 hover:bg-slate-100 focus:bg-white w-full pl-9 py-2 pr-3 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-sm transition-all h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Sales Data */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <svg
            className="animate-spin h-6 w-6 text-slate-855"
            xmlns="http://www.w3.org/2055/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
        </div>
      ) : groupedSales.length === 0 ? (
        <div className="text-center text-slate-400 font-semibold py-20 text-xs tracking-wide">
          No matching records found.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {groupedSales.map((group, groupIndex) => (
              <div
                key={`group-${groupIndex}`}
                className="bg-white border border-slate-150 hover:border-slate-250 shadow-sm rounded-lg overflow-hidden flex flex-col justify-between transition-all duration-200"
                onDoubleClick={() =>
                  role === "admin" && setVisibleDeleteGroup((prev) =>
                    prev === `${group.hotel.id}-${group.date}` ? null : `${group.hotel.id}-${group.date}`
                  )
                }
              >
                <div>
                  {/* Header */}
                  <div className={`p-3 flex flex-col gap-0.5 ${
                    group.is_closed ? 'bg-rose-50/30' : 'bg-slate-50/50'
                  }`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="font-bold text-slate-800 text-xs line-clamp-1 leading-tight">
                        {group.hotel.name}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {group.is_closed && (
                          <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 rounded flex items-center gap-0.5">
                            <XCircle size={8} />
                            CLOSED
                          </span>
                        )}
                        <span className={`text-xs font-bold ${
                          group.is_closed ? 'text-rose-600' : 'text-slate-900'
                        }`}>
                          {hotel_type === 0
                            ? formatINRCurrency(group.total)
                            : (
                              <span className="flex items-center gap-1 text-[11px] font-bold">
                                <Box size={10} className="text-slate-500" /> {parseFloat(group.total)}
                              </span>
                            )}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                      <span>{group.formattedDate}</span>
                      {role === "admin" && visibleDeleteGroup === `${group.hotel.id}-${group.date}` && (
                        <button
                          onClick={() => handleDeleteGroup(group)}
                          title="Delete this sales group"
                          className="text-rose-500 hover:text-rose-700 p-0.5 rounded hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="px-3 py-2 divide-y divide-slate-100">
                    {group.is_closed ? (
                      <div className="flex items-center justify-center py-3 text-rose-500">
                        <XCircle size={14} className="mr-1.5 flex-shrink-0" />
                        <span className="text-[9px] font-semibold uppercase tracking-wider">No sales - Closed</span>
                      </div>
                    ) : (
                      group.items.map((item, index) => (
                        <div
                          key={`item-${index}`}
                          className="flex justify-between items-center py-1.5"
                        >
                          <span className="text-[11px] font-normal text-slate-600">
                            {item.sales_category?.name || "N/A"}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-800">
                            {hotel_type === 0 ? formatINRCurrency(item.amount) : parseFloat(item.amount)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Grand Total - Sleek slate summary bar */}
          <div className="bg-slate-800 p-3.5 rounded-lg flex justify-between items-center text-white mt-6 shadow-sm">
            <span className="font-bold text-xs uppercase tracking-wider opacity-90">
              Grand Total {hotel_type === 0 ? "Amount" : "Boxes"}
            </span>
            <span className="font-bold text-base tracking-tight">
              {hotel_type === 0 ? formatINRCurrency(grandTotal) : parseFloat(grandTotal)}
            </span>
          </div>
        </div>
      )}

      <div className="h-6" />
    </div>
  );
}
