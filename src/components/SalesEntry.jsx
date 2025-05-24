import { useEffect, useState } from "react";
import { makeGet, makePost } from "@/lib/api";
import {
  Calendar,
  Save,
  ArrowRight,
  PlusCircle,
  MinusCircle,
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
          initial[cat.id] = 0;
        });
        setAmounts(initial);

        // Set first category as active if there are categories
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
    const sum = Object.values(amounts).reduce((acc, curr) => acc + curr, 0);
    setTotal(sum);
  }, [amounts]);

  const handleChange = (id, value) => {

    setAmounts((prev) => ({
      ...prev,
      [id]: parseFloat(value) || 0,
    }));
  };

  const handleIncrement = (id, amount = 1) => {
    setAmounts((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + amount,
    }));
  };

  const handleDecrement = (id, amount = 1) => {
    setAmounts((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) - amount),
    }));
  };

  const confirmSubmission = async () => {
    setLoading(true)
    handleCloseModal()

    try {
      const payload = {
        date: pendingSubmission.date,
        sales: pendingSubmission.sales.map(({ category_id, amount }) => ({ category_id, amount }))
      }

      await makePost('/daily-sales/bulk', payload)

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      router.push('/user/sales')
    } catch (error) {
      console.error('Error submitting sales:', error)
      alert('Something went wrong while submitting sales.')
    } finally {
      setLoading(false)
    }
  }




  const formatINRCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  const isAnyAmountGreaterThanZero = Object.values(amounts).some(
    (amt) => amt > 0
  );


  const handleCloseModal = () => {
    setIsClosing(true);
    // Wait for animation to complete before hiding modal
    setTimeout(() => {
      setShowConfirmModal(false);
      setIsClosing(false);
    }, 300); // 300ms matches the animation duration
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Daily Sales Entry</h1>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm text-gray-700 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Tab Selection */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
                activeCategory === category.id
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Active Form */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${
              activeCategory === category.id ? "block" : "hidden"
            }`}>
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">
                {category.name}
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="border-b border-gray-300 pb-2 mb-4">
                  <div className="w-full flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleDecrement(category.id)}
                      className="h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200">
                      <MinusCircle className="w-6 h-6" />
                    </button>

                    <div className="flex items-center justify-center">
                      <span className="text-2xl font-medium text-gray-600 mr-1">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={amounts[category.id]}
                        onChange={(e) =>
                          handleChange(category.id, e.target.value)
                        }
                        className="w-24 text-center text-3xl font-bold text-gray-900 border-none focus:outline-none focus:ring-0"
                        onFocus={(e) => {
                          if (e.target.value === '0') {
                            e.target.select();
                          }
                        }}
                     />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleIncrement(category.id)}
                      className="h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200">
                      <PlusCircle className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const currIndex = categories.findIndex(
                      (cat) => cat.id === category.id
                    );
                    const nextIndex = (currIndex + 1) % categories.length;
                    setActiveCategory(categories[nextIndex].id);
                  }}
                  className="px-4 py-2 text-sm font-medium text-green-600 flex items-center hover:bg-green-50 rounded">
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <div className="text-right">
                  <div className="text-sm text-gray-500">Category Total</div>
                  <div className="text-lg font-bold">
                    {formatINRCurrency(amounts[category.id])}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fixed Bottom with Total and Submit */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm font-medium text-gray-700">Total Sales</div>
          <div className="text-xl font-bold text-green-600">
            {formatINRCurrency(total)}
          </div>
        </div>
        <button
          onClick={() => {
            const salesData = Object.entries(amounts)
              .filter(([_, amount]) => amount > 0)
              .map(([category_id, amount]) => ({
                category_id,
                amount,
                category_name:
                  categories.find((c) => c.id == category_id)?.name ||
                  "Unknown",
              }));

            setPendingSubmission({ date, sales: salesData });
            setShowConfirmModal(true);
            setIsClosing(false);
          }}
          disabled={loading || !isAnyAmountGreaterThanZero}
          className="w-full flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? (
            "Submitting..."
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
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg">
          Sales submitted successfully!
        </div>
      )}

{showConfirmModal && pendingSubmission && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop with fade animation */}
    <div
      className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleCloseModal}
    />

    {/* Modal with scale and fade animation */}
    <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-out ${
      isClosing
        ? 'scale-95 -translate-y-5 opacity-0'
        : 'scale-100 translate-y-0 opacity-100'
    }`}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Confirm Submission</h2>
              <p className="text-sm text-gray-500">Review your sales data before submitting</p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors duration-200"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Sales Data Summary</h3>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="space-y-3">
              {pendingSubmission.sales.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">{item.category_name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatINRCurrency(item.amount)}</span>
                </div>
              ))}
            </div>

            {/* Total calculation */}
            <div className="mt-4 pt-3 border-t border-gray-300">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Total Amount</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatINRCurrency(pendingSubmission.sales.reduce((sum, item) => sum + item.amount, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Warning/Info message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-blue-700">
              Once submitted, this data cannot be modified. Please review carefully before confirming.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={handleCloseModal}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={confirmSubmission}
            className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Confirm & Submit</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
