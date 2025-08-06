import { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
import { makeGet } from "@/lib/api";
const LOCAL_STORAGE_KEY = "salesFilters"; 
export default function SalesFilter({ onApplyFilter,hotel_type }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSalesCategories, setSelectedSalesCategories] = useState([]);
  const [selectedHotels, setSelectedHotels] = useState([]);

  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [salesCategory, setSalesCategory] = useState([]);

  const totalSelected =
    selectedCities.length + selectedCategories.length + selectedHotels.length + selectedSalesCategories.length;

    useEffect(() => {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSelectedCities(parsed.cities || []);
        setSelectedCategories(parsed.categories || []);
        setSelectedHotels(parsed.hotels || []);
        setSelectedSalesCategories(parsed.salesCategory || []);
      
        onApplyFilter({
          cities: parsed.cities || [],
          categories: parsed.categories || [],
          salesCategory: parsed.salesCategory || [],
          hotels: parsed.hotels || [],
        });
      }
    }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const data = await makeGet("admin/filters", {
          hotel_type: hotel_type, // or 0/1 based on your logic
        });
        
        setCities(data.cities || []);
        setCategories(data.categories || []);
        setHotels(data.hotels || []);
        setSalesCategory(data.salesCategories || []);
      } catch (error) {
        console.error("Failed to fetch filter options", error);
      }
    };

    fetchFilters();
  }, []);

  const toggleSelection = (id, selectedArray, setSelectedArray) => {
    const exists = selectedArray.includes(id);
    if (exists) {
      setSelectedArray(selectedArray.filter(i => i !== id));
    } else {
      setSelectedArray([...selectedArray, id]);
    }
  };



  const handleApply = () => {
    const appliedFilters = {
      cities: selectedCities,
      categories: selectedCategories,
      salesCategory: selectedSalesCategories,
      hotels: selectedHotels,
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appliedFilters)); // ✅
    onApplyFilter(appliedFilters);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedCities([]);
    setSelectedCategories([]);
    setSelectedHotels([]);
    setSelectedSalesCategories([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY); // ✅
  };

  const FilterChip = ({ label, isSelected, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
        isSelected
          ? "bg-blue-500 text-white border-blue-500"
          : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
      }`}>
      {label}
    </button>
  );

  return (
    <>
      {/* Compact Filter Bar */}
      <div className="p-3 flex items-center justify-between">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-blue-500 text-white  text-sm rounded-lg hover:bg-blue-600 transition-colors  px-3 py-1  text-sm">
          <Filter size={16} />
          Filter
          {totalSelected > 0 && (
            <span className="bg-white text-blue-500 px-2 py-1 rounded-full text-xs font-bold ml-1">
              {totalSelected}
            </span>
          )}
        </button>

        {/* Quick selected tags
        {totalSelected > 0 && (
          <div className="flex items-center gap-2 flex-1 ml-3">
            <div className="flex gap-1 overflow-x-auto">
              {[...selectedCities, ...selectedCategories, ...selectedHotels].slice(0, 3).map((item, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs whitespace-nowrap">
                  {item}
                </span>
              ))}
              {totalSelected > 3 && (
                <span className="text-gray-500 text-xs px-2 py-1">
                  +{totalSelected - 3} more
                </span>
              )}
            </div>
          </div>
        )} */}
      </div>

      {/* Bottom Sheet Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-900/50  bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Bottom Sheet */}
          <div className="relative w-full bg-white rounded-t-2xl max-h-[75vh] flex flex-col animate-slide-up">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Filter Options
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Cities */}
              <div>
                <h3 className="text-sm font-medium text-gray-800 mb-3">
                  Cities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cities.map((city) => (
                    <FilterChip
                      key={city.id}
                      label={city.name}
                      onClick={() => toggleSelection(city.id, selectedCities, setSelectedCities)}
                      isSelected={selectedCities.includes(city.id)}

                    />
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-sm font-medium text-gray-800 mb-3">
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <FilterChip
                      key={category.id}
                      label={category.name}
                      onClick={() => toggleSelection(category.id, selectedCategories, setSelectedCategories)}
                      isSelected={selectedCategories.includes(category.id)}

                    />
                  ))}
                </div>
              </div>

              {/* salesCategory */}
              <div>
                <h3 className="text-sm font-medium text-gray-800 mb-3">
                  Sales Category
                </h3>
                <div className="flex flex-wrap gap-2">
                  {salesCategory.map((sc) => (
                    <FilterChip
                      key={sc.id}
                      label={sc.name}
                      onClick={() => toggleSelection(sc.id, selectedSalesCategories, setSelectedSalesCategories)}
                      isSelected={selectedSalesCategories.includes(sc.id)}

                    />
                  ))}
                </div>
              </div>


              {/* Hotels */}
              <div>
                <h3 className="text-sm font-medium text-gray-800 mb-3">
                  Hotels
                </h3>
                <div className="flex flex-wrap gap-2">
                  {hotels.map((hotel) => (
                    <FilterChip
                      key={hotel.id}
                      label={hotel.name}
                      onClick={() => toggleSelection(hotel.id, selectedHotels, setSelectedHotels)}
                      isSelected={selectedHotels.includes(hotel.id)}

                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={handleClear}
                  disabled={totalSelected === 0}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Clear ({totalSelected})
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
