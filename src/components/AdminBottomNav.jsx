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
    <nav className="bg-white border-t border-gray-300 shadow-inner fixed bottom-0 left-0 right-0 flex justify-around py-2 z-50">
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
            className={`flex flex-col items-center text-sm ${
              isActive ? 'text-blue-600 font-semibold' : 'text-gray-500'
            }`}
          >
            <Icon size={20} />
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

