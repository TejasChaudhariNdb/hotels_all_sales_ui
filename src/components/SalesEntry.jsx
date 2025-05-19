import { useEffect, useState } from 'react'
import { makeGet, makePost } from '@/lib/api'
import { Calendar, DollarSign, Save, ArrowRight, PlusCircle, MinusCircle } from 'lucide-react'

export default function DailySalesForm() {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [categories, setCategories] = useState([])
  const [amounts, setAmounts] = useState({})
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await makeGet('/sales-categories')
        setCategories(res.data)

        const initial = {}
        res.data.forEach((cat) => {
          initial[cat.id] = 0
        })
        setAmounts(initial)

        // Set first category as active if there are categories
        if (res.data.length > 0) {
          setActiveCategory(res.data[0].id)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [])

  // Calculate total whenever amounts change
  useEffect(() => {
    const sum = Object.values(amounts).reduce((acc, curr) => acc + curr, 0)
    setTotal(sum)
  }, [amounts])

  const handleChange = (id, value) => {
    setAmounts((prev) => ({
      ...prev,
      [id]: parseFloat(value) || 0
    }))
  }

  const handleIncrement = (id, amount = 1) => {
    setAmounts((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + amount
    }))
  }

  const handleDecrement = (id, amount = 1) => {
    setAmounts((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) - amount)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const salesData = Object.entries(amounts).map(([category_id, amount]) => ({
        category_id,
        amount
      }))

      const payload = {
        date,
        sales: salesData,
      }

      await makePost('/daily-sales/bulk', payload)

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error submitting sales:', error)
      alert('Something went wrong while submitting sales.')
    } finally {
      setLoading(false)
    }
  }

  const formatINRCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount)

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
              }`}
            >
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
            }`}
          >
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">{category.name}</h2>
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
                      className="h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      <MinusCircle className="w-6 h-6" />
                    </button>

                    <div className="flex items-center justify-center">
                      <span className="text-2xl font-medium text-gray-600 mr-1">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={amounts[category.id]}
                        onChange={(e) => handleChange(category.id, e.target.value)}
                        className="w-24 text-center text-3xl font-bold text-gray-900 border-none focus:outline-none focus:ring-0"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleIncrement(category.id)}
                      className="h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      <PlusCircle className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const currIndex = categories.findIndex(cat => cat.id === category.id)
                    const nextIndex = (currIndex + 1) % categories.length
                    setActiveCategory(categories[nextIndex].id)
                  }}
                  className="px-4 py-2 text-sm font-medium text-green-600 flex items-center hover:bg-green-50 rounded"
                >
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <div className="text-right">
                  <div className="text-sm text-gray-500">Category Total</div>
                  <div className="text-lg font-bold">{formatINRCurrency(amounts[category.id])}</div>
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
          <div className="text-xl font-bold text-green-600">{formatINRCurrency(total)}</div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : (
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
    </div>
  )
}