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
    <aside className="hidden md:flex md:flex-col md:w-72 md:h-screen md:sticky md:top-0 bg-white border-r border-slate-100 z-40 transition-colors duration-300">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3.5 border-b border-slate-100">
        <div className="p-1.5 bg-slate-100 rounded-xl flex-shrink-0">
          <img className="h-10 w-10 object-contain" src="/logo.png" alt="Heera Group Logo" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-800 tracking-tight">
            Heera Group
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            Revenue Portal
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
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
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group text-sm font-semibold ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon
                size={20}
                className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <span className="tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 space-y-2 border-t border-slate-100 bg-slate-50/50">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-all duration-200 shadow-sm text-sm"
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <>
                <Sun className="w-5 h-5 text-amber-500 animate-pulse" />
                <span className="font-medium text-slate-600">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-slate-500" />
                <span className="font-medium text-slate-600">Dark Mode</span>
              </>
            )}
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 uppercase font-bold text-slate-400">
            {theme}
          </span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50/50 transition-all duration-200 text-sm font-semibold active:scale-95"
        >
          <LogOut size={18} className="text-rose-500 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
