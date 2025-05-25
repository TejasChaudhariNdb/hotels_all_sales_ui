import { useEffect, useState } from "react";
import { makeGet, makePost } from "@/lib/api";
import {
  Calendar,
  Save,
  ArrowLeft,
  ArrowRight,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function DailySalesForm() {
  const router = useRouter();
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [categories, setCategories] = useState([]);
  const [amounts, setAmounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [total, setTotal] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await makeGet("/sales-categories");
        setCategories(res.data);

        const initial = {};
        res.data.forEach((cat) => {
          initial[cat.id] = "";
        });
        setAmounts(initial);

        if (res.data.length > 0) {
          setActiveCategory(res.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Calculate total whenever amounts change
  useEffect(() => {
    const sum = Object.values(amounts).reduce((acc, curr) => {
      const num = parseFloat(curr) || 0;
      return acc + num;
    }, 0);
    setTotal(sum);
  }, [amounts]);

  const handleChange = (id, value) => {
    // Allow only numbers and decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      return;
    }
    
    setAmounts((prev) => ({
      ...prev,
      [id]: cleanValue,
    }));
  };

  const clearAmount = (categoryId) => {
    setAmounts((prev) => ({
      ...prev,
      [categoryId]: "",
    }));
  };

  const getCurrentCategoryIndex = () => {
    return categories.findIndex(cat => cat.id === activeCategory);
  };

  const goToPrevious = () => {
    const currentIndex = getCurrentCategoryIndex();
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : categories.length - 1;
    setActiveCategory(categories[prevIndex].id);
  };

  const goToNext = () => {
    const currentIndex = getCurrentCategoryIndex();
    const nextIndex = (currentIndex + 1) % categories.length;
    setActiveCategory(categories[nextIndex].id);
  };

  const confirmSubmission = async () => {
    setLoading(true);
    handleCloseModal();

    try {
      const payload = {
        date: pendingSubmission.date,
        sales: pendingSubmission.sales.map(({ category_id, amount }) => ({ 
          category_id, 
          amount: parseFloat(amount) 
        }))
      };

      await makePost('/daily-sales/bulk', payload);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      router.push('/user/sales');
    } catch (error) {
      console.error('Error submitting sales:', error);
      alert('Something went wrong while submitting sales.');
    } finally {
      setLoading(false);
    }
  };

  const formatINRCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  const isAnyAmountGreaterThanZero = Object.values(amounts).some(
    (amt) => parseFloat(amt) > 0
  );

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowConfirmModal(false);
      setIsClosing(false);
    }, 300);
  };

  const formatDisplayAmount = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(num);
  };

  const currentCategory = categories.find(cat => cat.id === activeCategory);
  const currentIndex = getCurrentCategoryIndex();

  return (
    <div className="flex flex-col bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Daily Sales</h1>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm font-medium text-gray-700 bg-transparent border-none focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPrevious}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            disabled={categories.length <= 1}>
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold text-gray-900">{currentCategory?.name}</h2>
            <p className="text-sm text-gray-500">{currentIndex + 1} of {categories.length}</p>
          </div>
          
          <button
            onClick={goToNext}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            disabled={categories.length <= 1}>
            <ArrowRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6">
        {currentCategory && ( 
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Amount Input */}
            <div className="mb-8">
              <label className="block text-base font-medium text-gray-700 mb-4">
                Enter Amount : <span className="text-lg font-bold">{currentCategory.name}</span>
              </label>
              
              <div className="relative">
                <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-3xl font-bold text-gray-400">
                  ₹
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amounts[currentCategory.id]}
                  onChange={(e) => handleChange(currentCategory.id, e.target.value)}
                  placeholder="0"
                  className="w-full pl-16 pr-16 py-6 text-4xl font-bold text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-center"
                  autoFocus
                />
                {amounts[currentCategory.id] && (
                  <button
                    onClick={() => clearAmount(currentCategory.id)}
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>
              
              {amounts[currentCategory.id] && (
                <div className="mt-4 text-center">
                  <p className="text-lg text-gray-600">
                    {formatINRCurrency(parseFloat(amounts[currentCategory.id]))}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Total & Submit */}
      <div className="bg-white border-t border-gray-200 p-4 safe-area-bottom">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Total Sales</span>
            <span className="text-xs text-gray-500">
              {Object.values(amounts).filter(amt => parseFloat(amt) > 0).length} categories
            </span>
          </div>
          <div className="text-2xl font-bold text-green-600 text-center">
            {formatINRCurrency(total)}
          </div>
        </div>
        
        <button
          onClick={() => {
            const salesData = Object.entries(amounts)
              .filter(([_, amount]) => parseFloat(amount) > 0)
              .map(([category_id, amount]) => ({
                category_id,
                amount: parseFloat(amount),
                category_name: categories.find((c) => c.id == category_id)?.name || "Unknown",
              }));

            setPendingSubmission({ date, sales: salesData });
            setShowConfirmModal(true);
            setIsClosing(false);
          }}
          disabled={loading || !isAnyAmountGreaterThanZero}
          className="w-full flex items-center justify-center bg-green-500 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:bg-green-600 active:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Submitting...
            </div>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Submit Sales
            </>
          )}
        </button>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-20 left-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl shadow-lg z-50">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-xs">✓</span>
            </div>
            Sales submitted successfully!
          </div>
        </div>
      )}

      {/* Mobile Optimized Confirmation Modal */}
      {showConfirmModal && pendingSubmission && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0">
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${
              isClosing ? 'opacity-0' : 'opacity-100'
            }`}
            onClick={handleCloseModal}
          />

          <div className={`relative bg-white rounded-t-3xl shadow-2xl w-full max-h-[80vh] overflow-y-auto transform transition-all duration-300 ease-out ${
            isClosing
              ? 'translate-y-full opacity-0'
              : 'translate-y-0 opacity-100'
          }`}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-gray-100 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Confirm Submission</h2>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Review your sales data</p>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4">
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Sales Summary</h3>
                <div className="space-y-3">
                  {pendingSubmission.sales.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 bg-gray-50 rounded-lg px-4">
                      <span className="font-medium text-gray-700">{item.category_name}</span>
                      <span className="font-semibold text-gray-900">{formatINRCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-700">Total Amount</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatINRCurrency(pendingSubmission.sales.reduce((sum, item) => sum + item.amount, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-700">
                  Once submitted, this data cannot be modified. Please review carefully.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 safe-area-bottom">
              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 py-3 px-4 text-gray-700 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={confirmSubmission}
                  className="flex-1 py-3 px-4 text-white bg-green-500 rounded-xl font-medium hover:bg-green-600 active:bg-green-700 transition-colors">
                  Confirm & Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}