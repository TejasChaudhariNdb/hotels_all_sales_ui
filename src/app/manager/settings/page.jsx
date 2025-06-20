"use client";

import {
  Bell,
  Globe,
  ShieldCheck,
  Settings,
  UserPlus,
  Users,
  LogOut,
  ArrowRight,
  Settings2,
  User,
  Camera,
  Edit3
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"
export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth()
  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push("/login");
  };



  return (
    <div className=" bg-gradient-to-br from-slate-50 to-blue-50/30 ">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* User Profile Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user.name.split(' ').map(n => n[0]).join('').toUpperCase()
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors">
                <Camera size={14} />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                  <Edit3 size={16} className="text-gray-400" />
                </button>
              </div>
              <p className="text-gray-600 text-sm">{user.phone}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
               Hotels : {user.managed_hotels.length} 
              </span>
            </div>
          </div>
        </div>

        {/* Settings Options */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-500 px-2 mb-4">
            Hotels Assinged
          </div>

       
                     {/* Right: Assigned Hotels */}
                     <div
    
      className="group flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
    >
    <div className="flex flex-wrap gap-1">
              {user.managed_hotels?.length > 0 ? (
                user.managed_hotels.map((hotel) => (
                  <span
                    key={hotel.id}
                    className="bg-blue-100 text-blue-700 px-2 py-1 text-xs rounded-lg font-medium">
                    {hotel.name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-rose-500 font-medium">No Hotels Assigned</span>
              )}
            </div>
    </div>
          
             
      
       
        </div>
        {/* Settings Options */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-500 px-2 mb-4">
            PREFERENCES
          </div>

      
          <SettingItem
            icon={<ShieldCheck />}
            title="Privacy & Security"
            subtitle="Manage your privacy settings"
            link="/manager/settings"
          />
        </div>



        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full mt-8 py-4 text-center bg-gradient-to-r from-red-50 to-red-100 text-red-600 font-medium rounded-2xl shadow-sm hover:from-red-100 hover:to-red-200 transition-all duration-200 border border-red-100"
        >
          <LogOut className="inline-block mr-2" size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

function SettingItem({ icon, title, subtitle, link }) {
  return (
    <Link
      href={link}
      className="group flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-gray-50 rounded-xl text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
          {icon}
        </div>
        <div>
          <div className="text-gray-900 font-medium">{title}</div>
          {subtitle && (
            <div className="text-sm text-gray-500 mt-0.5">{subtitle}</div>
          )}
        </div>
      </div>
      <ArrowRight className="text-gray-400 group-hover:text-blue-500 transition-colors" size={18} />
    </Link>
  );
}