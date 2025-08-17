"use client"
import React, { useState ,useEffect} from 'react'
import {
  ArrowLeft,
  Save,
  X,
  Hotel,
  Store,
  Wine,
  Tag
} from 'lucide-react'

import { makePost ,makeGet,makePut} from '@/lib/api'
import { useRouter,useSearchParams } from 'next/navigation'
const channelToIdMap = {
    Hotel: 1,
    Trade: 2,
    Wineshop: 3,
  }



const idToChannelMap = {
  1: 'Hotel',
  2: 'Trade',
  3: 'Wineshop',
}
const channelOptions = [
  {
    value: 'Hotel',
    label: 'Hotel',
    icon: <Hotel size={18} />,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  {
    value: 'Trade',
    label: 'Trade',
    icon: <Store size={18} />,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200'
  },
  {
    value: 'Wineshop',
    label: 'Wineshop',
    icon: <Wine size={18} />,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200'
  }
]

export default function AddCategoryPage() {
  const [categoryName, setCategoryName] = useState('')
  const [selectedChannel, setSelectedChannel] = useState('')
  const [margin, setMargin] = useState('') 
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryId = searchParams.get('id') // if present → edit mode
  const isEditMode = Boolean(categoryId)




   // Fetch category details if editing
   useEffect(() => {
    const fetchCategory = async () => {
      if (!isEditMode) return
      try {
        setLoading(true)
        const res = await makeGet(`/admin/sales-categories/${categoryId}`)
        const data = res
        setCategoryName(data.name)
        setSelectedChannel(idToChannelMap[data.category_type_id])
        setMargin(data.margin)
      } catch (error) {
        console.error("Failed to load category", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategory()
  }, [categoryId, isEditMode])



  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!categoryName.trim()) newErrors.categoryName = 'Category name is required'
    if (!selectedChannel) newErrors.selectedChannel = 'Please select a channel'
    if (!margin) newErrors.margin = 'Margin is required'
    else if (isNaN(margin) || margin < 0) newErrors.margin = 'Margin must be a positive number'
    else if (margin > 100) newErrors.margin = 'Margin cannot be greater than 100%'
    
    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      try {
        const payload = {
          name: categoryName.trim(),
          category_type_id: channelToIdMap[selectedChannel],
          margin: Number(margin),  
        }

       
        if (isEditMode) {
          await makePut(`/admin/sales-categories/${categoryId}`, payload)
        } else {
          await makePost('/admin/sales-categories', payload)
        }
        router.push('/admin/settings/categorys')

        // Reset form
        setCategoryName('')
        setSelectedChannel('')
        setMargin('')
      } catch (error) {
        console.error(error)
        alert('Something went wrong. Please try again.')
      }
    }
  }

  const selectedChannelConfig = channelOptions.find(option => option.value === selectedChannel)

  return (
    <div className="">
      <div className="">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button className="p-2 hover:bg-white rounded-lg transition-colors shadow-sm">
              <ArrowLeft size={20} className="text-gray-600"  onClick={() => router.back()}  />
            </button>
            <div>
            <h1 className="text-2xl font-bold text-gray-900" >
                {isEditMode ? 'Edit Category' : 'Add New Category'}
              </h1>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="space-y-6">
            {/* Category Name Field */}
            <div>
              <label htmlFor="categoryName" className="block text-sm font-semibold text-gray-700 mb-3">
                Category Name
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Tag className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name..."
                  className={`text-black w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.categoryName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.categoryName && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <X size={14} />
                  {errors.categoryName}
                </p>
              )}
            </div>

 {/* Margin Field */}
 <div>
              <label htmlFor="margin" className="block text-sm font-semibold text-gray-700 mb-3">
                Margin (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="margin"
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  placeholder="Enter margin..."
                  className={`text-black w-full pr-12 pl-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.margin ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  min="0"
                  max="100" 
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  %
                </span>
              </div>
              {errors.margin && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <X size={14} />
                  {errors.margin}
                </p>
              )}
            </div>


            {/* Channel Assignment Field */}
            <div>
              <label htmlFor="channel" className="block text-sm font-semibold text-gray-700 mb-3">
                Assign to Channel
              </label>
              <div className="space-y-3">
                {channelOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedChannel === option.value
                        ? `${option.border} ${option.bg}`
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="channel"
                      value={option.value}
                      checked={selectedChannel === option.value}
                      onChange={(e) => setSelectedChannel(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`flex items-center gap-3 ${
                      selectedChannel === option.value ? option.color : 'text-gray-600'
                    }`}>
                      {option.icon}
                      <span className="font-medium">{option.label}</span>
                    </div>
                    {selectedChannel === option.value && (
                      <div className={`ml-auto w-5 h-5 rounded-full ${option.color.replace('text-', 'bg-')} flex items-center justify-center`}>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </label>
                ))}
              </div>
              {errors.selectedChannel && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <X size={14} />
                  {errors.selectedChannel}
                </p>
              )}
            </div>

            {/* Preview Card */}
            {(categoryName.trim() || selectedChannel) && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview</h3>
                <div className={`bg-white rounded-lg p-3 shadow-sm border flex items-center gap-3 ${
                  selectedChannelConfig ? selectedChannelConfig.border : 'border-gray-200'
                }`}>
                  <div className={`p-2 rounded-lg ${
                    selectedChannelConfig ? `${selectedChannelConfig.bg} ${selectedChannelConfig.color}` : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Tag size={16} />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">
                      {categoryName.trim() || 'Category name...'}
                    </span>
                    {selectedChannelConfig && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`text-xs ${selectedChannelConfig.color}`}>
                          {selectedChannelConfig.icon}
                        </span>
                        <span className={`text-xs ${selectedChannelConfig.color}`}>
                          {selectedChannelConfig.label}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Save size={18} />
                {isEditMode ? 'Update Category' : 'Add Category'}
              </button>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}