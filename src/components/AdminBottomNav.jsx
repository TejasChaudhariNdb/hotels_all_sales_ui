'use client';

import { Boxes, Home, LineChart, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/admin/', icon: Home },
  { name: 'Sales', href: '/admin/sales', icon: LineChart },
  { name: 'Boxes', href: '/admin/boxes', icon: Boxes },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl flex justify-around p-1.5 z-50 border border-slate-200/80 dark:border-slate-800/80 transition-all duration-300">
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
            className={`flex flex-col items-center justify-center transition-all duration-200 py-2 px-2 rounded-xl w-full group ${
              isActive 
                ? 'bg-slate-800 dark:bg-slate-800 text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'
            }`}
          >
            <Icon 
              size={20} 
              className={`transition-all duration-200 ${
                isActive 
                  ? 'text-white scale-105' 
                  : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
              }`} 
            />
            <span 
              className={`text-[11px] mt-0.5 font-bold tracking-wide transition-colors duration-200 ${
                isActive 
                  ? 'text-white font-extrabold' 
                  : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
              }`}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}



