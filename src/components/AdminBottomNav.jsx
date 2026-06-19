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
    <nav className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 bg-slate-950/95 backdrop-blur-md rounded-2xl shadow-2xl flex justify-around p-2.5 z-50 border border-slate-800/90 transition-all duration-300">
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
            className={`flex flex-col items-center justify-center transition-all duration-200 py-2.5 px-2 rounded-xl w-full group ${
              isActive ? 'bg-slate-800/90 shadow-inner' : 'hover:bg-slate-800/40'
            }`}
          >
            <Icon size={24} className={`transition-all duration-200 ${isActive ? 'text-white scale-105' : 'text-slate-350 group-hover:text-slate-200'}`} />
            <span className={`text-[13px] mt-1 font-bold tracking-wide transition-colors duration-200 ${
              isActive ? 'text-white font-extrabold' : 'text-slate-400'
            }`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}


