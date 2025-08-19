"use client"
import { useState } from "react";
import { Calendar, Building2, DollarSign, Check, ChevronDown } from "lucide-react";
import { makePost ,makeGet,makePut} from '@/lib/api'
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
export default function ExpenseForm() {
  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    rent: "",
    license_fee: "",
    salary: "",
    light_bill: "",
    interest: "",
    miscellaneous: "",
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit =  async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!form.rent || !form.salary || !form.light_bill) {
      toast.error("Please fill in Rent, Salary, and Electricity fields");
      return;
    }
  
    setLoading(true);

      try {
        await makePost("/expenses", form);
        router.push("/user/exp"); 
        toast.success("Expenses is added for this month");
      } catch (err) {
        toast.error("Expenses is already added for this month");
        console.error(err);
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

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-6">
      {/* Header */}
      <div className="mb-8">

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Monthly Expenses
        </h1>
        <p className="text-gray-600 text-center text-sm">
          Track your hotel's monthly expenses
        </p>
      </div>

      <div className="space-y-6 max-w-md mx-auto">

        {/* Date Selection Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            Period
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <select
                name="month"
                value={form.month}
                onChange={handleChange}
                required
                className="w-full h-12 bg-gray-50 rounded-xl border-0 px-3 text-sm font-medium appearance-none focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
              >
                {months.map((month, i) => (
                  <option key={i + 1} value={i + 1}>
                    {month}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <input
              type="number"
              name="year"
              value={form.year}
              onChange={handleChange}
              className="h-12 bg-gray-50 rounded-xl border-0 px-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
              required
            />
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            💰 Expense Details
          </h3>
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
                    value={form[field.key]}
                    onChange={handleChange}
                    onFocus={() => setFocusedField(field.key)}
                    onBlur={() => setFocusedField("")}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={`w-full h-12 bg-gray-50 rounded-xl border-0 pl-8 pr-4 text-sm font-medium transition-all ${
                      focusedField === field.key
                        ? 'bg-white ring-2 ring-green-500 shadow-lg'
                        : 'focus:bg-white focus:ring-2 focus:ring-green-500'
                    }`}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">₹</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full h-14 rounded-2xl font-semibold text-white shadow-lg transition-all ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 active:scale-95'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                Save Expenses
              </div>
            )}
          </button>
        </div>
        </div>

  
    </div>
  );
}