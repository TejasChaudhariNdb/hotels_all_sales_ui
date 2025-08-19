"use client"
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { makeGet, makePut } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

export default function EditExpenseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));

  const [loading, setLoading] = useState(true);
  const [focusedField, setFocusedField] = useState("");
  const [form, setForm] = useState({
    year: "",
    month: "",
    rent: "",
    license_fee: "",
    salary: "",
    light_bill: "",
    interest: "",
    miscellaneous: "",
  });

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  // Prefill (your pattern)
  useEffect(() => {
    if (!month || !year) {
      toast.error("Missing month/year");
      router.push("/user/exp");
      return;
    }

    const fetchExpense = async () => {
      try {
        const data = await makeGet("/expenses", { month, year });
        if (data && Object.keys(data).length) {
          setForm({
            year: data.year ?? year,
            month: data.month ?? month,
            rent: data.rent ?? "",
            license_fee: data.license_fee ?? "",
            salary: data.salary ?? "",
            light_bill: data.light_bill ?? "",
            interest: data.interest ?? "",
            miscellaneous: data.miscellaneous ?? "",
          });
        } else {
          toast.info("No expense found for this month. You can add one.");
          router.push("/user/exp/add");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load expenses");
        router.push("/user/exp");
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [month, year, router]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    if (!form.rent || !form.salary || !form.light_bill) {
      toast.error("Please fill in Rent, Salary, and Electricity fields");
      return;
    }

    setLoading(true);
    try {
      // send numeric values if your API expects numbers
      await makePut("/expenses", {
        month,
        year,
        rent: Number(form.rent) || 0,
        license_fee: Number(form.license_fee) || 0,
        salary: Number(form.salary) || 0,
        light_bill: Number(form.light_bill) || 0,
        interest: Number(form.interest) || 0,
        miscellaneous: Number(form.miscellaneous) || 0,
      });
      toast.success("Expenses updated successfully");
      router.push("/user/exp");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update expenses");
    } finally {
      setLoading(false);
    }
  };

  const expenseFields = [
    { key: "rent", label: "Rent", icon: "🏢" },
    { key: "license_fee", label: "License Fee", icon: "📋" },
    { key: "salary", label: "Salary", icon: "👥" },
    { key: "light_bill", label: "Electricity", icon: "💡" },
    { key: "interest", label: "Interest", icon: "📈" },
    { key: "miscellaneous", label: "Miscellaneous", icon: "📦" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Editing {months[month - 1]} {year} Expenses
        </h1>
        <p className="text-gray-600 text-sm">Update your monthly expenses</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
        {/* Expense fields only (date removed) */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">💰 Expense Details</h3>

          <div className="space-y-4">
            {expenseFields.map((field) => (
              <div key={field.key} className="relative">
                <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
                  <span className="text-lg">{field.icon}</span>
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name={field.key}
                    value={(form)[field.key] ?? ""}
                    onChange={handleChange}
                    onFocus={() => setFocusedField(field.key)}
                    onBlur={() => setFocusedField("")}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={`w-full h-12 bg-gray-50 rounded-xl border-0 pl-8 pr-4 text-sm font-medium transition-all ${
                      focusedField === field.key
                        ? "bg-white ring-2 ring-green-500 shadow-lg"
                        : "focus:bg-white focus:ring-2 focus:ring-green-500"
                    }`}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`w-full h-14 rounded-2xl font-semibold text-white shadow-lg transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 active:scale-95"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                Update Expenses
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
