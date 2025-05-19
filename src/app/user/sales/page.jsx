"use client"
import { useEffect, useState } from 'react'
import { makeGet } from '@/lib/api'
import { Search, Download, Calendar, ArrowDown, ArrowUp } from 'lucide-react'

export default function SalesPage() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' })

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await makeGet('/daily-sales')
        setSales(res.data || [])
      } catch (err) {
        console.error('Failed to load sales', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSales()
  }, [])

  const formatDate = (dateStr) => {
    const options = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }
    return new Date(dateStr).toLocaleString('en-IN', options)
  }

  const getFilteredAndSortedSales = () => {
    const grouped = {}

    sales.forEach(sale => {
      const key = sale.date
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(sale)
    })

    const sorted = Object.entries(grouped).sort(([dateA], [dateB]) => {
      const compare = new Date(dateA) - new Date(dateB)
      return sortConfig.direction === 'asc'
        ? compare
        : -compare
    })

    return sorted.map(([date, entries]) => {
      const items = entries.flatMap(e => e.items)
      const filteredItems = items.filter(item =>
        item.sales_category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      const total = filteredItems.reduce((sum, item) => sum + parseFloat(item.amount), 0)

      return {
        date,
        formattedDate: formatDate(date),
        items: filteredItems,
        total,
      }
    }).filter(group => group.items.length > 0)
  }

  const groupedSales = getFilteredAndSortedSales()
  const grandTotal = groupedSales.reduce((sum, group) => sum + group.total, 0)

  const toggleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const exportToCSV = () => {
    const rows = [['Date', 'Category', 'Amount']]

    groupedSales.forEach(group => {
      group.items.forEach(item => {
        rows.push([
          group.formattedDate,
          item.sales_category?.name || 'N/A',
          item.amount,
        ])
      })
      rows.push(['', `Total`, group.total.toFixed(2)])
    })

    rows.push(['', 'Grand Total', grandTotal.toFixed(2)])

    const csvContent = 'data:text/csv;charset=utf-8,' +
      rows.map(e => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'daily_sales.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatINRCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
              <Calendar className="mr-2 text-indigo-600" size={20} />
              Daily Sales
            </h1>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex items-center w-full">
                <Search className="absolute left-3 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by category"
                  className="border border-gray-300 pl-10 py-2 pr-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={exportToCSV}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center transition-colors"
              >
                <Download size={16} className="mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 flex justify-center items-center">
            <div className="animate-pulse flex space-x-4">
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : groupedSales.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No matching records found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4">
            {/* Only show on larger screens */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th
                      className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => toggleSort('date')}
                    >
                      <div className="flex items-center">
                        Date
                        {sortConfig.key === 'date' && (
                          sortConfig.direction === 'asc'
                            ? <ArrowUp size={14} className="ml-1 text-indigo-600" />
                            : <ArrowDown size={14} className="ml-1 text-indigo-600" />
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th
                      className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => toggleSort('amount')}
                    >
                      <div className="flex items-center justify-end">
                        Amount
                        {sortConfig.key === 'amount' && (
                          sortConfig.direction === 'asc'
                            ? <ArrowUp size={14} className="ml-1 text-indigo-600" />
                            : <ArrowDown size={14} className="ml-1 text-indigo-600" />
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupedSales.map((group) => (
                    <>
                      {group.items.map((item, index) => (
                        <tr key={`${group.date}-${item.id}`} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {index === 0 ? (
                              <div className="text-gray-700">{group.formattedDate}</div>
                            ) : ''}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-gray-700">{item.sales_category?.name || 'N/A'}</div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="text-gray-700">{formatINRCurrency(item.amount)}</div>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50">
                        <td className="py-3 px-4" colSpan={2}>
                          <div className="font-medium text-gray-700">Date Total</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-medium text-gray-700">{formatINRCurrency(group.total)}</div>
                        </td>
                      </tr>
                    </>
                  ))}
                  <tr className="bg-indigo-50">
                    <td className="py-4 px-4" colSpan={2}>
                      <div className="font-bold text-indigo-700">Grand Total</div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="font-bold text-indigo-700">{formatINRCurrency(grandTotal)}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile-friendly card view */}
            <div className="md:hidden">
              {groupedSales.map((group, groupIndex) => (
                <div key={`mobile-group-${groupIndex}`} className="mb-6">
                  <div className="bg-indigo-50 p-3 rounded-t-lg border border-gray-200">
                    <div className="font-medium text-gray-800">{group.formattedDate}</div>
                  </div>

                  <div className="border-x border-gray-200">
                    {group.items.map((item, index) => (
                      <div
                        key={`mobile-${group.date}-${item.id}`}
                        className="p-3 border-b border-gray-200 flex justify-between items-center"
                      >
                        <div className="text-gray-700">{item.sales_category?.name || 'N/A'}</div>
                        <div className="font-medium">{formatINRCurrency(item.amount)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 p-3 flex justify-between items-center border border-t-0 border-gray-200">
                    <div className="font-medium">Date Total</div>
                    <div className="font-medium">{formatINRCurrency(group.total)}</div>
                  </div>
                </div>
              ))}

              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex justify-between items-center mt-4">
                <div className="font-bold text-indigo-700">Grand Total</div>
                <div className="font-bold text-indigo-700">{formatINRCurrency(grandTotal)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}