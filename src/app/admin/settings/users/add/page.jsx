'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { makeGet ,makePost} from "@/lib/api";
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

  return (
    <div className="">
      <div className="rounded-xl shadow-lg  bg-white">
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Add New User</h1>
          <p className="text-gray-600 text-sm">Fill in the details to create a new user account</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`  mb-6 p-4 rounded-lg text-center font-medium ${
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
                className="w-full border border-gray-300 p-4 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                className="w-full border border-gray-300 p-4 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                  className="w-full border border-gray-300 p-4 pr-12 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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

            {/* Hotel Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Hotel *
              </label>
              <select
                name="hotel_id"
                className="w-full border border-gray-300 p-4 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
                value={formData.hotel_id}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="">
                  {isLoading ? 'Loading hotels...' : 'Select a hotel'}
                </option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </option>
                ))}
              </select>
            </div>

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