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
    onApplyFilter({
      cities: [],
      categories: [],
      salesCategory: [],
      hotels: [],
    });
    setIsOpen(false);
  };

  const FilterChip = ({ label, isSelected, onClick }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs font-semibold tracking-wide transition-all ${
        isSelected
          ? "bg-slate-800 text-white shadow-sm"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      } rounded-md`}
    >
      {label}
    </button>
  );

  return (
    <>
      {/* Compact Filter Bar */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 rounded-lg transition-all shadow-sm active:scale-95 h-9"
      >
        <Filter size={13} className="opacity-90" />
        <span>Filter</span>
        {totalSelected > 0 && (
          <span className="bg-white text-slate-800 px-1.5 py-0.5 rounded-full text-[9px] font-bold ml-0.5">
            {totalSelected}
          </span>
        )}
      </button>

      {/* Bottom Sheet Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />

          {/* Bottom Sheet */}
          <div className="relative w-full bg-white rounded-t-xl max-h-[80vh] flex flex-col animate-slide-up shadow-2xl">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">
                Filter Options
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Cities */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Cities
                </h3>
                <div className="flex flex-wrap gap-1.5">
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
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Categories
                </h3>
                <div className="flex flex-wrap gap-1.5">
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
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Sales Category
                </h3>
                <div className="flex flex-wrap gap-1.5">
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
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Hotels
                </h3>
                <div className="flex flex-wrap gap-1.5">
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
            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  disabled={totalSelected === 0}
                  className="flex-1 bg-white text-slate-600 py-1.5 rounded-lg font-semibold transition-all hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-xs border border-slate-200 h-9 flex items-center justify-center"
                >
                  Clear ({totalSelected})
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-1.5 rounded-lg font-semibold transition-all shadow-sm active:scale-[0.98] text-xs h-9 flex items-center justify-center"
                >
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
          animation: slide-up 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
