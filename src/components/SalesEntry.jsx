import { useEffect, useState, useRef, useCallback } from "react";
import { makeGet, makePost } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  Save,
  X,
  Box,
  XCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  TrendingUp,
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
  const [showClosedConfirmModal, setShowClosedConfirmModal] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isClosingClosedModal, setIsClosingClosedModal] = useState(false);
  const { user } = useAuth();

  // Swipe handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const swipeAreaRef = useRef(null);
  const chipScrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const startDate = url.searchParams.get("start");

    if (startDate) {
      setDate(startDate);
      url.searchParams.delete("start");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, []);

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

  // Scroll active chip into view
  useEffect(() => {
    if (chipScrollRef.current && activeCategory) {
      const activeChip = chipScrollRef.current.querySelector(
        `[data-chip-id="${activeCategory}"]`
      );
      if (activeChip) {
        activeChip.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeCategory]);

  // Focus input when category changes
  useEffect(() => {
    if (inputRef.current) {
      // Small delay to allow animations
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [activeCategory]);

  const handleChange = (id, value) => {
    const cleanValue = value.replace(/[^0-9.]/g, "");
    const parts = cleanValue.split(".");
    if (parts.length > 2) return;

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
    return categories.findIndex((cat) => cat.id === activeCategory);
  };

  const goToPrevious = useCallback(() => {
    setActiveCategory((prev) => {
      const currentIndex = categories.findIndex((cat) => cat.id === prev);
      const prevIndex =
        currentIndex > 0 ? currentIndex - 1 : categories.length - 1;
      return categories[prevIndex].id;
    });
  }, [categories]);

  const goToNext = useCallback(() => {
    setActiveCategory((prev) => {
      const currentIndex = categories.findIndex((cat) => cat.id === prev);
      const nextIndex = (currentIndex + 1) % categories.length;
      return categories[nextIndex].id;
    });
  }, [categories]);

  // Swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX; // Reset so a tap with no move doesn't trigger swipe
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const minSwipe = 50;

    if (Math.abs(diff) > minSwipe) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
  };

  const confirmSubmission = async () => {
    setLoading(true);
    handleCloseModal();

    try {
      let payload;
      const isBoxType = user.hotel_type === 1;

      if (isBoxType) {
        payload = {
          date: pendingSubmission.date,
          sales: pendingSubmission.sales.map(({ category_id, amount }) => ({
            sales_category_id: category_id,
            quantity: parseFloat(amount),
            box_type: "small",
          })),
        };
      } else {
        payload = {
          date: pendingSubmission.date,
          sales: pendingSubmission.sales.map(({ category_id, amount }) => ({
            category_id,
            amount: parseFloat(amount),
          })),
        };
      }

      const url = isBoxType ? "/boxes-sales/bulk" : "/daily-sales/bulk";

      await makePost(url, payload);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      router.push("/user/sales");
    } catch (error) {
      console.error("Error submitting sales:", error);
      alert("Something went wrong while submitting sales.");
    } finally {
      setLoading(false);
    }
  };

  const handleClosedDay = () => {
    setShowClosedConfirmModal(true);
    setIsClosingClosedModal(false);
  };

  const confirmClosedDay = async () => {
    setLoading(true);
    handleCloseClosedModal();

    try {
      const isBoxType = user.hotel_type === 1;

      const closedSalesData = categories.map((cat) => ({
        category_id: cat.id,
        amount: 0,
        category_name: cat.name,
      }));

      let payload;
      if (isBoxType) {
        payload = {
          date: date,
          is_closed: true,
          sales: closedSalesData.map(({ category_id }) => ({
            sales_category_id: category_id,
            quantity: 0,
            box_type: "small",
          })),
        };
      } else {
        payload = {
          date: date,
          is_closed: true,
          sales: closedSalesData.map(({ category_id }) => ({
            category_id,
            amount: 0,
          })),
        };
      }

      const url = isBoxType ? "/boxes-sales/bulk" : "/daily-sales/bulk";
      await makePost(url, payload);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      router.push("/user/sales");
    } catch (error) {
      console.error("Error submitting closed day:", error);
      alert("Something went wrong while marking day as closed.");
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

  const handleCloseClosedModal = () => {
    setIsClosingClosedModal(true);
    setTimeout(() => {
      setShowClosedConfirmModal(false);
      setIsClosingClosedModal(false);
    }, 300);
  };

  const formatDisplayAmount = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(num);
  };

  const currentCategory = categories.find((cat) => cat.id === activeCategory);
  const currentIndex = getCurrentCategoryIndex();
  const filledCount = Object.values(amounts).filter(
    (amt) => parseFloat(amt) > 0
  ).length;
  const progressPercent =
    categories.length > 0 ? (filledCount / categories.length) * 100 : 0;

  const isBoxType = user?.hotel_type === 1;
  const unitLabel = isBoxType ? "Boxes" : "Amount";
  const unitSymbol = isBoxType ? null : "₹";



  const handleSubmitClick = () => {
    const salesData = Object.entries(amounts)
      .filter(([_, amount]) => parseFloat(amount) > 0)
      .map(([category_id, amount]) => ({
        category_id,
        amount: parseFloat(amount),
        category_name:
          categories.find((c) => c.id == category_id)?.name || "Unknown",
      }));

    setPendingSubmission({ date, sales: salesData });
    setShowConfirmModal(true);
    setIsClosing(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-40">
      {/* ============ HEADER ============ */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto">
          {/* Top row: Title + Date */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                <TrendingUp className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900 leading-tight">
                  Daily Sales
                </h1>
                <p className="text-[11px] text-gray-400 font-medium">
                  {new Date(date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Closed Button */}
              <button
                onClick={handleClosedDay}
                className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 active:bg-red-200 transition-all duration-200 flex items-center gap-1.5 border border-red-100"
              >
                <XCircle className="w-3.5 h-3.5" />
                Closed
              </button>

              {/* Date Picker */}
              <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 border border-gray-200/80">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="text-xs font-semibold text-gray-700 bg-transparent border-none focus:outline-none w-[105px]"
                />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Progress
              </span>
              <span className="text-[10px] font-bold text-emerald-600">
                {filledCount}/{categories.length} filled
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============ CATEGORY CHIPS (scrollable) ============ */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-100 py-2.5 sticky top-[105px] z-20">
        <div className="max-w-4xl mx-auto">
          <div
            ref={chipScrollRef}
            className="flex gap-2 overflow-x-auto px-4 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((cat) => {
              const isFilled = parseFloat(amounts[cat.id]) > 0;
              const isActive = cat.id === activeCategory;
              return (
                <button
                  key={cat.id}
                  data-chip-id={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`
                    flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0
                    ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-200/50 scale-105"
                        : isFilled
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
                    }
                  `}
                >
                  {isFilled && !isActive && (
                    <Check className="w-3 h-3 text-emerald-500" />
                  )}
                  {cat.name}
                  {isFilled && (
                    <span
                      className={`text-[10px] font-bold ${
                        isActive
                          ? "text-white/80"
                          : "text-emerald-500"
                      }`}
                    >
                      {isBoxType
                        ? amounts[cat.id]
                        : `₹${formatDisplayAmount(amounts[cat.id])}`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <div className="flex-1 px-4 py-5 max-w-4xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* === LEFT: Active Category Input (mobile: full width, desktop: 60%) === */}
          <div className="lg:w-[60%]">
            {currentCategory && (
              <div
                ref={swipeAreaRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Category Header with Navigation */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50/80 to-white">
                  <button
                    onClick={goToPrevious}
                    onTouchEnd={(e) => e.stopPropagation()}
                    className="w-9 h-9 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center transition-all duration-200 shadow-sm lg:hidden"
                    disabled={categories.length <= 1}
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>

                  <div className="flex-1 text-center">
                    <h2 className="text-lg font-bold text-gray-900">
                      {currentCategory.name}
                    </h2>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5 lg:hidden">
                      Swipe or tap chips to switch • {currentIndex + 1}/
                      {categories.length}
                    </p>
                  </div>

                  <button
                    onClick={goToNext}
                    onTouchEnd={(e) => e.stopPropagation()}
                    className="w-9 h-9 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center transition-all duration-200 shadow-sm lg:hidden"
                    disabled={categories.length <= 1}
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Amount Input Area */}
                <div className="p-5">
                  <label className="block text-sm font-semibold text-gray-500 mb-3">
                    Enter {unitLabel}
                  </label>

                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-gray-300 group-focus-within:text-emerald-400 transition-colors duration-200">
                      {isBoxType ? (
                        <Box className="w-6 h-6" />
                      ) : (
                        "₹"
                      )}
                    </div>
                    <input
                      ref={inputRef}
                      type="text"
                      inputMode="decimal"
                      value={amounts[currentCategory.id] || ""}
                      onChange={(e) =>
                        handleChange(currentCategory.id, e.target.value)
                      }
                      placeholder="0"
                      className="w-full pl-14 pr-14 py-5 text-3xl sm:text-4xl font-bold text-gray-900 bg-gray-50/80 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 transition-all duration-300 text-center placeholder:text-gray-200"
                    />
                    {amounts[currentCategory.id] && (
                      <button
                        onClick={() => clearAmount(currentCategory.id)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-9 h-9 rounded-full bg-gray-200/80 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Formatted display */}
                  {amounts[currentCategory.id] && (
                    <div className="mt-2 text-center">
                      <p className="text-sm text-gray-400 font-medium">
                        {isBoxType
                          ? `${parseFloat(amounts[currentCategory.id])} boxes`
                          : formatINRCurrency(
                              parseFloat(amounts[currentCategory.id])
                            )}
                      </p>
                    </div>
                  )}


                </div>
              </div>
            )}
          </div>

          {/* === RIGHT: All Categories Summary (desktop only) === */}
          <div className="hidden lg:block lg:w-[40%]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-[160px]">
              <div className="px-5 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50/80 to-white">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-500" />
                  All Categories
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {categories.map((cat) => {
                  const isFilled = parseFloat(amounts[cat.id]) > 0;
                  const isActive = cat.id === activeCategory;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-5 py-3.5 transition-all duration-200 text-left ${
                        isActive
                          ? "bg-emerald-50/60 border-l-3 border-emerald-500"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                            isFilled
                              ? "bg-emerald-100"
                              : isActive
                              ? "bg-emerald-100"
                              : "bg-gray-100"
                          }`}
                        >
                          {isFilled ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400">
                              {categories.indexOf(cat) + 1}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            isActive
                              ? "text-emerald-700"
                              : isFilled
                              ? "text-gray-700"
                              : "text-gray-500"
                          }`}
                        >
                          {cat.name}
                        </span>
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          isFilled ? "text-gray-900" : "text-gray-300"
                        }`}
                      >
                        {isFilled
                          ? isBoxType
                            ? amounts[cat.id]
                            : `₹${formatDisplayAmount(amounts[cat.id])}`
                          : "—"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Filled Categories Summary (collapsible) */}
        {filledCount > 0 && (
          <div className="mt-4 lg:hidden">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Filled entries
                </p>
              </div>
              <div className="divide-y divide-gray-50">
                {categories
                  .filter((cat) => parseFloat(amounts[cat.id]) > 0)
                  .map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between px-4 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-sm font-medium text-gray-600">
                          {cat.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {isBoxType
                          ? amounts[cat.id]
                          : `₹${formatDisplayAmount(amounts[cat.id])}`}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============ FIXED BOTTOM BAR ============ */}
      <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200/60 safe-area-bottom fixed bottom-16 left-0 right-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* Total Display */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {isBoxType ? "Total Boxes" : "Total Sales"}
              </p>
              <p className="text-xl font-extrabold text-gray-900">
                {isBoxType
                  ? parseFloat(total) || 0
                  : formatINRCurrency(total)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Categories
              </p>
              <p className="text-sm font-bold text-emerald-600">
                {filledCount} of {categories.length}
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmitClick}
            disabled={loading || !isAnyAmountGreaterThanZero}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-200/60 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:from-gray-400 disabled:to-gray-500"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                Submitting...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Submit Sales
              </>
            )}
          </button>
        </div>
      </div>

      {/* ============ SUCCESS TOAST ============ */}
      {showSuccess && (
        <div className="fixed top-4 left-4 right-4 max-w-md mx-auto z-50 animate-[slideDown_0.3s_ease-out]">
          <div className="bg-emerald-500 text-white rounded-xl px-4 py-3 shadow-xl shadow-emerald-500/25 flex items-center gap-3">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm">
              Sales submitted successfully!
            </span>
          </div>
        </div>
      )}

      {/* ============ CLOSED DAY MODAL ============ */}
      {showClosedConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out ${
              isClosingClosedModal ? "opacity-0" : "opacity-100"
            }`}
            onClick={handleCloseClosedModal}
          />

          <div
            className={`relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[70vh] overflow-y-auto transform transition-all duration-300 ease-out ${
              isClosingClosedModal
                ? "translate-y-full sm:translate-y-0 sm:scale-95 opacity-0"
                : "translate-y-0 sm:scale-100 opacity-100"
            }`}
          >
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Modal Header */}
            <div className="px-6 pt-4 pb-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  Mark Day as Closed
                </h2>
                <button
                  onClick={handleCloseClosedModal}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-red-900 mb-1">
                      Shop Closed
                    </h3>
                    <p className="text-sm text-red-700 leading-relaxed">
                      Mark{" "}
                      <span className="font-semibold">
                        {new Date(date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>{" "}
                      as closed?
                    </p>
                    <p className="text-xs text-red-600/70 mt-1.5">
                      This will record zero {isBoxType ? "boxes" : "sales"} for
                      all categories.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-xs text-blue-600">
                  💡 This helps differentiate between days with no sales and days
                  where data wasn't entered.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 safe-area-bottom">
              <div className="flex gap-3">
                <button
                  onClick={handleCloseClosedModal}
                  className="flex-1 py-3 px-4 text-gray-700 bg-gray-100 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClosedDay}
                  disabled={loading}
                  className="flex-1 py-3 px-4 text-white bg-red-500 rounded-xl font-semibold text-sm hover:bg-red-600 active:bg-red-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Mark Closed
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ SALES CONFIRMATION MODAL ============ */}
      {showConfirmModal && pendingSubmission && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out ${
              isClosing ? "opacity-0" : "opacity-100"
            }`}
            onClick={handleCloseModal}
          />

          <div
            className={`relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[80vh] overflow-y-auto transform transition-all duration-300 ease-out ${
              isClosing
                ? "translate-y-full sm:translate-y-0 sm:scale-95 opacity-0"
                : "translate-y-0 sm:scale-100 opacity-100"
            }`}
          >
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 pt-4 pb-3 rounded-t-3xl sm:rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Confirm Submission
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Review your sales for{" "}
                    {new Date(date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4">
              <div className="space-y-2">
                {pendingSubmission.sales.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-3 bg-gray-50/80 rounded-xl px-4"
                  >
                    <span className="text-sm font-medium text-gray-600">
                      {item.category_name}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {isBoxType
                        ? parseFloat(item.amount)
                        : formatINRCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-gray-700">
                    Total {unitLabel}
                  </span>
                  <span className="text-xl font-extrabold text-emerald-600">
                    {isBoxType
                      ? parseFloat(
                          pendingSubmission.sales.reduce(
                            (sum, item) => sum + item.amount,
                            0
                          )
                        )
                      : formatINRCurrency(
                          pendingSubmission.sales.reduce(
                            (sum, item) => sum + item.amount,
                            0
                          )
                        )}
                  </span>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mt-4">
                <p className="text-xs text-amber-700 font-medium">
                  ⚠️ Once submitted, this data cannot be modified. Please review
                  carefully.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 safe-area-bottom">
              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 py-3 px-4 text-gray-700 bg-gray-100 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSubmission}
                  className="flex-1 py-3 px-4 text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-emerald-200/50 active:scale-[0.98] transition-all duration-200"
                >
                  Confirm & Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}