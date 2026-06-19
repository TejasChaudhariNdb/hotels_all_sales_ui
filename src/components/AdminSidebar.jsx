'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LineChart, Boxes, Settings, Moon, Sun, LogOut } from 'lucide-react';
import useTheme from '@/lib/useTheme';

const navItems = [
  { name: 'Dashboard', href: '/admin/', icon: Home },
  { name: 'Sales', href: '/admin/sales', icon: LineChart },
  { name: 'Boxes', href: '/admin/boxes', icon: Boxes },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, toggleTheme] = useTheme();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push('/super');
  };

  return (
    <aside className="hidden md:flex md:flex-col md:w-60 md:h-screen md:sticky md:top-0 bg-white border-r border-slate-100 z-40 transition-colors duration-300">
      {/* Brand Header */}
      <div className="p-4 flex items-center space-x-2.5 border-b border-slate-100">
        <div className="p-1 bg-slate-100 rounded-lg">
          <img className="h-8 w-8 object-contain" src="/logo.png" alt="Heera Group Logo" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-800 tracking-tight">
            Heera Group
          </h1>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
            Revenue Portal
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isDashboard = item.href === '/admin/';
          const isActive = isDashboard
            ? pathname === '/admin/' || pathname === '/admin'
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group relative text-xs font-semibold ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon
                size={16}
                className={`transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <span className="tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer (Theme & Logout) */}
      <div className="p-4 space-y-2 border-t border-slate-100 bg-slate-50/50">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-all duration-200 shadow-sm text-xs"
        >
          <div className="flex items-center space-x-2">
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="font-medium text-slate-600">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-500" />
                <span className="font-medium text-slate-600">Dark Mode</span>
              </>
            )}
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 uppercase font-bold text-slate-400">
            {theme}
          </span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50/50 transition-all duration-200 text-xs font-semibold active:scale-95 border border-transparent"
        >
          <LogOut size={16} className="text-rose-500" />
          <span className="tracking-wide">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
