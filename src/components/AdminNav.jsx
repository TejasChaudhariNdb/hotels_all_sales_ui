'use client';

import useTheme from '@/lib/useTheme';
import { Moon, Sun } from 'lucide-react';

export default function AdminNav() {
  const [theme, toggleTheme] = useTheme();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md transition-all duration-300 bg-white/80 text-gray-900 shadow-sm">
      <div className="flex justify-between items-center px-6 py-4">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <div className=" ">
          {/* <div className="p-2 rounded-xl transition-colors bg-gradient-to-br from-blue-500 to-indigo-600"> */}
            {/* <Hotel className="w-6 h-6 text-white" /> */}
            <img className=" h-10 text-white" src="/logo.png" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Heera Group
            </h1>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Revenue Portal
            </p>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          aria-label="Toggle theme"
          onClick={toggleTheme}
          className={`p-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm ${
            theme === 'dark'
              ? 'bg-slate-850 hover:bg-slate-800 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }`}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>
    </header>
  );
}