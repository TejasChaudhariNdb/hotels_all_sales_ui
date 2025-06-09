'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { makePost } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Eye, EyeOff, Phone, Lock, User, Heart } from 'lucide-react'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const res = await makePost('/auth/login', { phone, password })
      login(res.user, res.token)

      // Redirect based on role
      if (res.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/user')
      }
    } catch (err) {
      setError('Invalid credentials. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-50 to-purple-100 flex items-center justify-center px-4 py-8 relative">
      {/* Floating decoration elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-pink-300 to-rose-300 rounded-full opacity-60 animate-bounce"></div>
      <div className="absolute top-40 right-16 w-16 h-16 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full opacity-50 animate-pulse"></div>
      <div className="absolute bottom-32 left-20 w-12 h-12 bg-gradient-to-r from-green-300 to-emerald-300 rounded-full opacity-70 animate-bounce delay-1000"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full opacity-40 animate-pulse delay-500"></div>

      <div className="w-full max-w-sm relative z-10">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-full mb-4 shadow-lg animate-pulse">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Welcome Back!
          </h1>
          <p className="text-gray-600 text-base flex items-center justify-center gap-1">
            Sign in to continue your journey 
            <Heart className="w-4 h-4 text-pink-500 fill-current animate-pulse" />
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Input */}
            <div className="space-y-2">
              <label className="block text-gray-700 text-sm font-semibold">
                📱 Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-pink-400 focus:bg-white transition-all duration-300 hover:border-pink-300"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-gray-700 text-sm font-semibold">
                🔐 Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:bg-white transition-all duration-300 hover:border-purple-300"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-200 rounded-2xl p-4 animate-shake">
                <p className="text-red-700 text-sm text-center font-medium">❌ {error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing you in... ✨</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In 🚀
                  </span>
                )}
              </span>
            </button>
          </form>

          {/* Fun Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm flex items-center justify-center gap-1">
              Made with 
              <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
              for amazing users like you!
            </p>
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center mt-6 bg-white/60 backdrop-blur-sm rounded-2xl p-4">
          <p className="text-gray-700 text-sm font-medium">
            🤔 Need help? We're here for you!
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Contact support for assistance
          </p>
        </div>
      </div>
      
      {/* Custom CSS for shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}