'use client';
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { makeGet, makePost } from "@/lib/api";

export default function AddUserPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    hotel_id: '',
  });
  const [hotels, setHotels] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Memoized grouped businesses for better performance
  const groupedBusinesses = useMemo(() => {
    const categoryMap = {
      1: 'Hotels',
      2: 'Wine Shops',
      3: 'Trade'
    };

    return hotels.reduce((groups, business) => {
      const categoryId = business.category_type_id;
      const categoryName = categoryMap[categoryId] || `Category ${categoryId}`;
      
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(business);
      return groups;
    }, {});
  }, [hotels]);

  useEffect(() => {
    const fetchHotels = async () => {
      setIsLoading(true);
      try {
        const data = await makeGet('/admin/hotels');
        setHotels(data.data);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setMessage('Failed to load hotels');
        setMessageType('error');
        setIsLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear message when user starts typing
    if (message) {
      setMessage('');
      setMessageType('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await makePost('/admin/users', formData);
      setMessage('✅ User created successfully!');
      setMessageType('success');
      setFormData({ name: '', phone: '', password: '', hotel_id: '' });
    } catch (error) {
      setMessage(error.response?.data?.message || '❌ Failed to create user. Please try again.');
      setMessageType('error');
    }
    setIsLoading(false);
  };



  /* Alternative Version with Custom Dropdown (More Advanced) */
const renderBusinessSelect = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectedBusiness = hotels.find(h => h.id == formData.hotel_id);
  
  const filteredBusinesses = Object.entries(groupedBusinesses).reduce((acc, [category, businesses]) => {
    const filtered = businesses.filter(business => 
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {});

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
        Assign Business
        <span className="text-red-500 ml-1">*</span>
      </label>
      
      <div className="relative">
        {/* Custom Select Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="w-full text-left border-2 border-gray-200 p-4 rounded-xl bg-gradient-to-r from-white to-gray-50
                   hover:border-blue-300 hover:shadow-md focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                   transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-between">
            <span className={selectedBusiness ? "text-gray-800" : "text-gray-500"}>
              {isLoading ? (
                <span className="flex items-center">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Loading Businesses...
                </span>
              ) : selectedBusiness ? (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  {selectedBusiness.name} • {selectedBusiness.city}
                </span>
              ) : (
                "📋 Select a Business"
              )}
            </span>
            <svg className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        {/* Dropdown Panel */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-hidden">
            {/* Search Box */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Options List */}
            <div className="max-h-64 overflow-y-auto">
              {Object.entries(filteredBusinesses).map(([categoryName, businesses]) => (
                <div key={categoryName}>
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    🏢 {categoryName}
                  </div>
                  {businesses.map((business) => (
                    <button
                      key={business.id}
                      type="button"
                      onClick={() => {
                        handleChange({ target: { name: 'hotel_id', value: business.id } });
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 transition-colors border-b border-gray-50 last:border-b-0"
                    >
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        <div>
                          <div className="font-medium text-gray-800">{business.name}</div>
                          <div className="text-sm text-gray-500">{business.city}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
              
              {Object.keys(filteredBusinesses).length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.034 0-3.935.103-5.728.235a2.34 2.34 0 01-2.207-1.604C3.716 12.931 3.5 12.068 3.5 11.25v-1.875a2.25 2.25 0 012.25-2.25h12.5a2.25 2.25 0 012.25 2.25v1.875c0 .818-.216 1.681-.565 2.381a2.34 2.34 0 01-2.207 1.604A49.02 49.02 0 0112 15z" />
                  </svg>
                  No businesses found
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Hidden input for form submission */}
        <input
          type="hidden"
          name="hotel_id"
          value={formData.hotel_id}
          required
        />
      </div>
      
      {/* Helper Text */}
      <div className="mt-2 text-xs text-gray-500 flex items-center">
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        Choose the business to assign this user to
      </div>
    </div>
  );
};

  return (
    <div className="">
      <div className="rounded-xl shadow-lg bg-white">
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Add New User</h1>
          <p className="text-gray-600 text-sm">Fill in the details to create a new user account</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-center font-medium ${
            messageType === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-rose-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter full name"
                className="text-black w-full border border-gray-300 p-4 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                className="text-black w-full border border-gray-300 p-4 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  className="text-black w-full border border-gray-300 p-4 pr-12 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Business Selection - Optimized */}
            {renderBusinessSelect()}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                isLoading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Creating User...
                </div>
              ) : (
                '✨ Create User'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}