"use client";

export default function UserNav({ user }) {
  const hotelName = user?.hotel_name || "Your Hotel";

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg border-b transition-all duration-300 bg-white/95 shadow-sm border-gray-200">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        {/* Left - Logo + Hotel Name */}
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <div className="flex items-center justify-center w-12 h-12 rounded-xl shadow-lg overflow-hidden">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Hotel Info */}
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              {hotelName}
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Sales Dashboard
            </p>
          </div>
        </div>

        {/* Right - User Info
        <div className="flex items-center space-x-4">
       
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-sm">
              <svg 
                className="w-5 h-5 text-gray-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
            </div>
          
          </div>
        </div> */}
      </div>
    </header>
  );
}