'use client';
import { useEffect, useState, useMemo } from 'react';
import { Eye, EyeOff, User, Phone, Lock, Building2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { makeGet, makePost } from '@/lib/api';

export default function AddManagerPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    hotel_ids: [],
    role: 'manager',
  });

  const [hotels, setHotels] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  const groupedBusinesses = useMemo(() => {
    const categoryMap = {
      1: 'Hotels',
      2: 'Wine Shops',
      3: 'Trade',
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
        // Auto-expand first category
        const firstCategory = Object.keys(groupedBusinesses)[0];
        if (firstCategory) {
          setExpandedCategories({ [firstCategory]: true });
        }
      } catch (err) {
        setMessage('Failed to load businesses');
        setMessageType('error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotels();
  }, []);

  useEffect(() => {
    if (Object.keys(groupedBusinesses).length > 0) {
      const firstCategory = Object.keys(groupedBusinesses)[0];
      setExpandedCategories({ [firstCategory]: true });
    }
  }, [groupedBusinesses]);

  const handleCheckboxChange = (hotelId) => {
    setFormData((prev) => {
      const isSelected = prev.hotel_ids.includes(hotelId);
      return {
        ...prev,
        hotel_ids: isSelected
          ? prev.hotel_ids.filter((id) => id !== hotelId)
          : [...prev.hotel_ids, hotelId],
      };
    });

    if (message) {
      setMessage('');
      setMessageType('');
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (message) {
      setMessage('');
      setMessageType('');
    }
  };

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const handleSubmit = async () => {
    if (formData.hotel_ids.length === 0) {
      setMessage('Please select at least one business');
      setMessageType('error');
      return;
    }

    setIsLoading(true);

    try {
      await makePost('/admin/managers', formData);
      setMessage('Manager created successfully!');
      setMessageType('success');
      setFormData({
        name: '',
        phone: '',
        password: '',
        hotel_ids: [],
        role: 'manager',
      });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to create manager. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 ">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Manager</h1>
          <p className="text-gray-600 text-sm">Create and assign business access</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 shadow-sm ${
            messageType === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {messageType === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{message}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter full name"
                className="text-black w-full bg-gray-50 border-0 p-4 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                className="text-black w-full bg-gray-50 border-0 p-4 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter password"
                  className="text-black w-full bg-gray-50 border-0 p-4 pr-12 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Business Assignment */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Assign Businesses
                {formData.hotel_ids.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {formData.hotel_ids.length} selected
                  </span>
                )}
              </label>
              
              {isLoading ? (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-gray-500 text-sm">Loading businesses...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(groupedBusinesses).map(([categoryName, businesses]) => (
                    <div key={categoryName} className="bg-gray-50 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleCategory(categoryName)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-semibold text-gray-800">{categoryName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                            {businesses.length}
                          </span>
                          <div className={`transform transition-transform ${expandedCategories[categoryName] ? 'rotate-180' : ''}`}>
                            ⌄
                          </div>
                        </div>
                      </button>
                      
                      {expandedCategories[categoryName] && (
                        <div className="px-4 pb-4 space-y-2">
                          {businesses.map((business) => (
                            <label
                              key={business.id}
                              className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                formData.hotel_ids.includes(String(business.id))
                                  ? 'bg-blue-50 border-2 border-blue-200'
                                  : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.hotel_ids.includes(String(business.id))}
                                onChange={() => handleCheckboxChange(String(business.id))}
                                className="sr-only"
                              />
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                                formData.hotel_ids.includes(String(business.id))
                                  ? 'bg-blue-600 border-blue-600'
                                  : 'border-gray-300'
                              }`}>
                                {formData.hotel_ids.includes(String(business.id)) && (
                                  <CheckCircle className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">{business.name}</p>
                                <p className="text-gray-500 text-xs">{business.city}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                isLoading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Manager...
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  Create Manager
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}