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
    <nav className="fixed bottom-3.5 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-slate-900/95 backdrop-blur-md rounded-xl shadow-lg flex justify-around p-1.5 z-50 border border-slate-800 transition-all duration-300">
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
            className={`flex flex-col items-center justify-center transition-all duration-200 px-3 py-1 rounded-lg w-full ${
              isActive ? 'bg-slate-800' : 'hover:bg-slate-800/40'
            }`}
          >
            <Icon size={16} className={`transition-transform duration-200 ${isActive ? 'text-white' : 'text-slate-400'}`} />
            <span className={`text-[9px] mt-0.5 font-semibold tracking-wide transition-colors duration-200 ${
              isActive ? 'text-white' : 'text-slate-400'
            }`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

