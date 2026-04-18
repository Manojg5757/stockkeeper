'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, LayoutDashboard, Rocket, Settings, Receipt } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/', icon: Package, label: 'Inventory' },
    { href: '/billing', icon: Receipt, label: 'Billing' },
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/founders-portal', icon: Rocket, label: 'Founder\'s Portal' },
  ];

  return (
    <div className="h-screen w-16 bg-gray-950 border-r border-gray-800 flex flex-col items-center py-6 fixed left-0 top-0 z-50">
      <div className="mb-10 text-amber-500">
        <Package className="w-8 h-8" />
      </div>

      <nav className="flex-1 flex flex-col gap-6 w-full items-center">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link key={link.href} href={link.href} className="relative group">
              <div
                className={clsx(
                  "p-3 rounded-xl transition-all duration-300 relative z-10",
                  isActive ? "text-amber-500" : "text-gray-500 hover:text-gray-300"
                )}
              >
                <Icon className="w-6 h-6" />
                
                {/* Tooltip */}
                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-700 shadow-xl">
                  {link.label}
                </div>
              </div>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-amber-500/10 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <button className="p-3 text-gray-500 hover:text-gray-300 transition-colors">
          <Settings className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
