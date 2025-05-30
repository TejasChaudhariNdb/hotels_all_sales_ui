"use client"
import { Shield, LogOut, RefreshCw, Home, User, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

export default function UnauthorizedPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    // Simulate logout process
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        // Clear any stored tokens/sessions
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.clear();
        
        // Redirect to login
        window.location.href = '/login';
      }
    }, 1500);
  };

  const handleClearSession = () => {
    if (typeof window !== 'undefined') {
      // Clear session and reload
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col justify-center px-6 py-8 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-purple-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-20 left-20 w-48 h-48 bg-purple-600/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-56 h-56 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Main content container */}
      <div className="relative z-10 text-center max-w-sm mx-auto w-full">
        
        {/* Icon with role indicator */}
        <div className="relative mb-6">
          <div className="inline-block p-5 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl backdrop-blur-sm border border-red-500/30 animate-bounce">
            <Shield className="w-16 h-16 text-red-400 animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1">
            <div className="p-1.5 bg-yellow-500/30 rounded-full border border-yellow-500/50 animate-spin">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Error code - mobile optimized */}
        <div className="mb-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent animate-pulse">
            401
          </h1>
        </div>

        {/* Title and description */}
        <div className="mb-8 space-y-3">
          <h2 className="text-2xl font-bold text-white mb-3">
            Access Restricted
          </h2>
          <p className="text-gray-300 text-base leading-relaxed mb-4">
            You're logged in but don't have the required permissions for this area
          </p>
          
          {/* Role-specific message */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 font-medium text-sm">Role Mismatch</span>
            </div>
            <p className="text-amber-200/80 text-sm leading-relaxed">
              Your current account doesn't have admin/user privileges. Try logging in with an admin/user account to access this section.
            </p>
          </div>
        </div>

        {/* Action buttons - mobile stack */}
        <div className="space-y-4 mb-8">
          {/* Primary action - Logout */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full group relative px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg disabled:opacity-70"
          >
            <div className="flex items-center justify-center gap-3">
              {isLoggingOut ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  Logout & Switch Account
                </>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-white/20 to-blue-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 rounded-xl" />
          </button>

          {/* Secondary actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleClearSession}
              className="px-4 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 active:scale-95 transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Clear Session</span>
              </div>
            </button>

            <button
              onClick={handleGoHome}
              className="px-4 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 active:scale-95 transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              <div className="flex items-center justify-center gap-2">
                <Home className="w-4 h-4" />
                <span className="text-sm">Go Home</span>
              </div>
            </button>
          </div>
        </div>

        {/* Help section */}
        <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
          <h3 className="text-white font-medium mb-2 text-sm">Need Help?</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            If you believe you should have access, contact your administrator or try logging in with the correct account type.
          </p>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs">
            Session expires automatically after inactivity
          </p>
        </div>
      </div>
    </div>
  );
}