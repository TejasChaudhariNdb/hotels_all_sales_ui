"use client"

import { useRouter, usePathname } from "next/navigation"
import { Home, Clock, Settings, Plus } from "lucide-react"
import { useState, useEffect } from "react"

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState(() => {
    // Initialize based on the current pathname
    if (pathname === "/user") return "entry"
    if (pathname === "/user/sales") return "history"
    if (pathname === "/user/settings") return "settings"
    return "entry" // Default
  })

  // Effect to handle route changes
  useEffect(() => {
    if (pathname === "/user") setActiveTab("entry")
    else if (pathname === "/user/sales") setActiveTab("history")
    else if (pathname === "/user/settings") setActiveTab("settings")
  }, [pathname])

  const handleNavigation = (path, tab) => {
    setActiveTab(tab)
    router.push(path)
  }

  return (
    <>
      {/* Main Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-40 h-16">
        <div className="flex justify-around items-center h-full">
          <NavItem
            label="Entry"
            icon={<Home className="w-5 h-5" />}
            active={activeTab === "entry"}
            onClick={() => handleNavigation("/user", "entry")}
          />
          <NavItem
            label="History"
            icon={<Clock className="w-5 h-5" />}
            active={activeTab === "history"}
            onClick={() => handleNavigation("/user/sales", "history")}
          />
          <NavItem
            label="Settings"
            icon={<Settings className="w-5 h-5" />}
            active={activeTab === "settings"}
            onClick={() => handleNavigation("/user/settings", "settings")}
          />
        </div>
      </div>

      {/* Floating action button positioned at right side */}
      <div className="fixed bottom-20 right-6 z-40">
        <button
          onClick={() => handleNavigation("/user/")}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white shadow-lg transform transition-transform hover:scale-105 active:scale-95"
          aria-label="New Sale"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Safe area spacing for iOS devices */}
      <div className="h-16"></div>
    </>
  )
}

function NavItem({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center py-1 relative w-1/3 focus:outline-none transition-colors`}
    >
      {/* Animated indicator dot */}
      {active && (
        <span className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-green-500"></span>
      )}

      {/* Icon with animation */}
      <div className={`mb-1 transition-all duration-200 ${
        active
          ? "text-green-500 transform scale-110"
          : "text-gray-400"
      }`}>
        {icon}
      </div>

      {/* Label with animation */}
      <span className={`text-xs font-medium transition-all duration-200 ${
        active
          ? "text-green-500"
          : "text-gray-500"
      }`}>
        {label}
      </span>
    </button>
  )
}