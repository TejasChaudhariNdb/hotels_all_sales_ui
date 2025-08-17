'use client'

import React, { useState ,useEffect} from 'react'
import {
  Plus,
  Hotel,
  Store,
  Wine,
  Tag,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { makeGet } from '@/lib/api'
import { useRouter } from 'next/navigation'

const groupByAssignedTo = (data) => {
  return data.reduce((acc, curr) => {
    if (!acc[curr.assignedTo]) {
      acc[curr.assignedTo] = []
    }
    acc[curr.assignedTo].push(curr)
    return acc
  }, {})
}

const assignedToConfig = {
  Hotel: {
    icon: <Hotel size={20} />,
    color: 'blue',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    iconBg: 'bg-blue-100'
  },
  Trade: {
    icon: <Store size={20} />,
    color: 'emerald',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    iconBg: 'bg-emerald-100'
  },
  Wineshop: {
    icon: <Wine size={20} />,
    color: 'purple',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    iconBg: 'bg-purple-100'
  }
}

export default function CategoryPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [hoveredItem, setHoveredItem] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await makeGet('/admin/sales-categories')
        setCategories(data)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])


  const filteredCategories = categories.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })
  const grouped = groupByAssignedTo(filteredCategories)
  const totalCategories = categories.length

  return (
    <div className="min-h-screen">
      <div className="pb-8">
        {/* Header Section */}
        <div className="mb-8">
  <div className="flex justify-between items-center mb-6">
    <div>
      <h1 className="text-xl font-bold text-gray-900">Sales Categories</h1>
    </div>
    <button  onClick={() => router.push('categorys/add')} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
      <Plus size={18} />
      Add Category
    </button>
  </div>

  {/* Stats Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Tag className="text-blue-600" size={20} />
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Categories</p>
          <p className="text-2xl font-bold text-gray-900">{totalCategories}</p>
        </div>
      </div>
    </div>
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <Store className="text-green-600" size={20} />
        </div>
        <div>
          <p className="text-sm text-gray-600">Active Channels</p>
          <p className="text-2xl font-bold text-gray-900">3</p>
        </div>
      </div>
    </div>
  </div>
</div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-6 mb-8">
          {Object.entries(grouped).map(([group, items]) => {
            const config = assignedToConfig[group]
            return (
              <div key={group} className={`${config.bg} ${config.border} border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200`}>
                {/* Section Header */}
                <div className="flex items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`${config.iconBg} p-3 rounded-xl ${config.text}`}>
                      {config.icon}
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${config.text}`}>{group}</h2>
                      <p className="text-sm text-gray-600">{items.length} categories</p>
                    </div>
                  </div>
                </div>

                {/* Category Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer group"
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`p-2 ${config.iconBg} rounded-lg ${config.text}`}>
                            <Tag size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                          </div>
               
                     
                        </div>
                        {/* Action Menu */}
                        <div className='flex items-center '>
                        <div className="">
                            <h3 className="font-semibold text-md text-gray-600 ">{item.margin}%</h3>
                          </div>
                        <div className={`flex items-center gap-1 transition-opacity duration-200 ${hoveredItem === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                 
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Edit size={16} className="text-gray-500"    onClick={(e) => {
                              e.stopPropagation() // prevent parent click
                              router.push(`categorys/add?id=${item.id}`)
                            }}/>
                          </button>
                 
                        </div>
                        </div>
                 
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          <br />
          <br />
          <br />
          <br />
          <br />
        </div>

        {/* Empty State */}
        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-12 mb-8">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}