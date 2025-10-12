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
    <div className="max-w-md mx-auto p-4 bg-gray-100 ">


      {/* Header */}

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center">
          <Calendar className="mr-2 text-indigo-600" size={20} />
          {hotel_type === 0 ? "Sales" : "Boxes Sales"}
        </h1>
        <div className="flex items-center gap-2">
        {role === "admin" && <SalesFilter onApplyFilter={handleFilter} hotel_type={hotel_type} />}
        <button
          onClick={exportToCSV}
          className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 flex items-center text-sm">
          <Download size={16} className="mr-1" />
          Export
        </button>

        {role === "admin" && (
  <Link href={`/admin/noEntry?start=${fromDate}&todate=${toDate}`}>
    <CopyXIcon className="text-rose-600" />
  </Link>
)}

{role === "user" && (
  <Link href={`/user/noEntry?start=${fromDate}&todate=${toDate}`}>
  <CopyXIcon className="text-rose-600" />
</Link>
)}



        </div>

      </div>

{/* Date Filter */}
<div className="mb-4">
  <button
    onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
    className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 p-3 rounded-md text-left transition-colors duration-500 border border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
    aria-expanded={isDateFilterOpen}
    aria-label={isDateFilterOpen ? "Close date filter" : "Open date filter"}
  >
    <div className="flex items-center gap-2">
      <CalendarIcon size={16} className="text-gray-600" />
      <span className="text-gray-700 font-medium">
        {fromDate === toDate
          ? formatDate(fromDate)
          : `${formatDate(fromDate)} - ${formatDate(toDate)}`}
      </span>
    </div>
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-500 hidden sm:inline">
        {isDateFilterOpen ? 'Click to close' : 'Click to expand'}
      </span>
      {isDateFilterOpen ? (
        <ChevronUp color="black" size={16} className="transition-transform duration-200" />
      ) : (
        <ChevronDown color="black" size={16} className="transition-transform duration-200" />
      )}
    </div>
  </button>

  {/* Animated Dropdown */}
  <div
    className={`transition-all duration-300 overflow-hidden ${
      isDateFilterOpen ? "max-h-[500px] mt-2" : "max-h-0"
    }`}
  >
    <div className="bg-white rounded-md shadow p-4 border border-gray-200">

      {/* Shortcut Buttons */}
{/* Shortcut Buttons */}
<div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar whitespace-nowrap">
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
      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
    >
      {btn.label}
    </button>
  ))}
</div>


      {/* Date Inputs */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="text-black w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="text-black w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <button
        onClick={applyDateFilter}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors w-full"
      >
        Apply
      </button>
    </div>
  </div>
</div>



      {/* Search Input */}
      <div className="relative mb-4">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={16}
        />
        <input
          type="text"
          placeholder="Search by category"
          className="text-black w-full border border-gray-300 pl-10 py-2 pr-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
  
      </div>

      {/* Sales Data */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <svg
            className="animate-spin h-6 w-6 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
        </div>
      ) : groupedSales.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No matching records found.
        </div>
      ) : (
        <div>
        {groupedSales.map((group, groupIndex) => (
          <div
            key={`group-${groupIndex}`}
            className={`mb-6 bg-white shadow-md rounded-xl overflow-hidden border ${
              group.is_closed ? 'border-red-300' : 'border-gray-200'
            }`}
            onDoubleClick={() =>
              role === "admin" && setVisibleDeleteGroup((prev) =>
                prev === `${group.hotel.id}-${group.date}` ? null : `${group.hotel.id}-${group.date}`
              )
            }
          >
            {/* Header */}
            <div className={`p-3 rounded-t-lg border ${
              group.is_closed ? 'bg-red-50 border-red-200' : 'bg-indigo-50 border-gray-200'
            }`}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-sm text-gray-800">
                    {group.hotel.name}
                  </div>
                  {group.is_closed && (
                    <span className="px-2 py-0.5 text-xs font-semibold text-red-700 bg-red-200 rounded-full flex items-center gap-1">
                      <XCircle size={12} />
                      CLOSED
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-sm font-bold ${
                    group.is_closed ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {hotel_type === 0
                      ? formatINRCurrency(group.total)
                      : (
                        <div className="flex items-center gap-1">
                          <Box size={16} /> {parseFloat(group.total)}
                        </div>
                      )}
                  </div>
      
                  {role === "admin" &&
                    visibleDeleteGroup === `${group.hotel.id}-${group.date}` && (
                      <button
                        onClick={() => handleDeleteGroup(group)}
                        title="Delete this sales group"
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                  )}
                </div>
              </div>
      
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs text-gray-600">
                  {group.formattedDate}
                </div>
                <div className="text-xs text-gray-600">Total {hotel_type === 0 ? "Amount" : "Boxes"}</div>
              </div>
            </div>
      
            {/* Items */}
            <div className="divide-y divide-gray-200">
              {group.is_closed ? (
                <div className="flex items-center justify-center px-4 py-6 text-red-600">
                  <XCircle size={20} className="mr-2" />
                  <span className="text-sm font-medium">No sales - Shop was closed</span>
                </div>
              ) : (
                group.items.map((item, index) => (
                  <div
                    key={`item-${index}`}
                    className="flex justify-between items-center px-4 py-3">
                    <div className="text-sm text-gray-700">
                      {item.sales_category?.name || "N/A"}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {hotel_type === 0 ? formatINRCurrency(item.amount) : <>{parseFloat(item.amount)}</>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      
        {/* Grand Total */}
        <div className="bg-green-100 border border-green-300 p-4 rounded-xl shadow flex justify-between items-center mt-6">
          <div className="font-bold text-green-800 text-sm">Grand Total {hotel_type === 0 ? "Amount" : "Boxes"}</div>
          <div className="font-bold text-green-800 text-sm">
            {hotel_type === 0 ? formatINRCurrency(grandTotal) : parseFloat(grandTotal)}
          </div>
        </div>
      </div>
      )}


      <br />
      <br />
      <br />
    </div>
  );
}
