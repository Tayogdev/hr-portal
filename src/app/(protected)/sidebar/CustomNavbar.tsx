'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
  Calendar,
  Menu,
  X,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react';

type NavItem = {
  name: string;
  href: string;
  icon: React.JSX.Element;
};

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    name: 'Job listing',
    href: '/job-listing',
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    name: 'All applicants',
    href: '/all-applicants',
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: 'Company profile',
    href: '/company-profile',
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    name: 'Schedule',
    href: '/schedule',
    icon: <Calendar className="w-5 h-5" />,
  },
];

export default function CustomNavbar(): React.JSX.Element {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <>
      {/* Mobile Toggle Button - Fixed position */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          flex flex-col
        `}
      >
        {/* Logo Section - Fixed */}
        <div className="flex items-center justify-center px-4 py-6 border-gray-100">
          <Image
            src="https://www.tayog.in/assets/logo/full_blue.svg"
            alt="tayog logo"
            width={124}
            height={32}
            className="h-8 w-auto"
            onError={(e) => {
              // Fallback to text if logo fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <span className="hidden text-2xl font-bold text-blue-600">tayog</span>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg
                    transition-all duration-200 group
                   ${
                    isActive
                      ? 'bg-blue-50 text-blue-700' // Removed border-r-2 and border-blue-700
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                  `}
                >
                  <span className={`${isActive ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'}`}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section - Fixed */}
        <div className="border-t border-gray-100 p-4 space-y-2">
          {/* Settings */}
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>

          {/* Help Desk */}
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors">
            <HelpCircle className="w-4 h-4" />
            Help desk
          </button>

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>

          {/* Dynamic Username Below Logout */}
         

          {/* User Profile */}
          <div className="flex items-center gap-3 p-3 mt-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-blue-700">RD</span>
            </div>
            <div className="flex-1 min-w-0">
            <div className="w-full flex flex-col items-center mt-2 mb-4">
            <span className="text-sm font-semibold text-gray-700">
              {session?.user?.name || 'User'}
            </span>
          </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
  