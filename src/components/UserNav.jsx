"use client"

import { useState, useEffect } from "react"
import { Menu, X, Home, ChartBar, Settings, LogOut, User, Store, ChevronRight ,CircleUserRound} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
export default function UserNav({user}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState("sales")
const router = useRouter()


  const userName = user?.name || "Loading..."
  const userRole = user?.role || "User"
  const hotelName = user?.hotel_name

  // Close sidebar on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById("sidebar")
      const menuButton = document.getElementById("menu-button")

      if (sidebar && !sidebar.contains(event.target) &&
          menuButton && !menuButton.contains(event.target) && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const selectMenu = (menu) => {
  setActiveMenu(menu)
  setIsOpen(false)
  }


  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push("/login");
  };

  return (
    <>
      {/* Top Navbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 text-white sticky top-0 z-40">
        <button
          id="menu-button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="text-lg font-bold">HeeraSales</div>
        <div className="flex items-center space-x-2">

          <div className="text-sm truncate max-w-[100px]">{hotelName}</div>
          <Store className="w-5 h-5 text-gray-300" />

        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-900/50  z-50  transition-opacity duration-300" />
      )}

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`fixed top-0 left-0 w-64 h-full bg-gray-900 z-100 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Heera Sales</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile */}
          <div className="px-4 py-6 border-b border-gray-700">
            <div className="flex items-center">
              <CircleUserRound   className="text-white w-10 h-10 "/>
              {/* <CircleUserRound /> */}
              <div className="ml-3">
                <p className="text-white font-medium">{userName}</p>
                <p className="text-gray-400 text-sm">{userRole}</p>
              </div>
            </div>
            <div className="mt-4">
              <button className="flex items-center text-sm text-gray-300 hover:text-white">
                <User className="w-4 h-4 mr-2" />
                View Profile
                <ChevronRight className="w-4 h-4 ml-auto" />
              </button>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex-grow py-4 overflow-y-auto">
            <ul className="space-y-1 px-2">
              <li>
                <Link
                  href="/user"
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeMenu === "sales"
                      ? "bg-green-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                  onClick={() => selectMenu("sales")}
                >
                  <Home className="w-5 h-5 mr-3" />
                  <span>Sales Entry</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/user/sales"
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeMenu === "history"
                      ? "bg-green-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                  onClick={() => selectMenu("history")}
                >
                  <ChartBar className="w-5 h-5 mr-3" />
                  <span>Sales History</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/user/settings"
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeMenu === "settings"
                      ? "bg-green-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                  onClick={() => selectMenu("settings")}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  <span>Settings</span>
                </Link>
              </li>
              <li>
                <button
                  href="/user/settings"
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeMenu === "logout"
                      ? "bg-green-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                  onClick={() => logout()}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={() => {
                logout()
                setIsOpen(false)
              }}
              className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
