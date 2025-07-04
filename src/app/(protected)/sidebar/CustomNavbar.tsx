'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
  Calendar,
  Menu,
  X,
  Settings,
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

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden p-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-600 focus:outline-none"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`bg-white z-50 border-r border-gray-200 w-64 fixed md:static top-0 left-0 h-screen transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between md:justify-center px-4 py-3">
          <Image
            src="https://www.tayog.in/assets/logo/full_blue.svg"
            alt="tayog logo"
            width={110}
            height={28}
            className="md:w-[124px] md:h-[32px] w-[110px] h-[28px]"
          />
          <div className="md:hidden">
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="flex flex-col gap-1 px-2 py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#F1F6FF] text-[#4F8FF0]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Fixed Section */}
        <div className="px-4 py-4 space-y-3 border-t border-gray-200 bg-white">
          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
              <path
                d="M15 9l-4-4v3H4v2h7v3l4-4z"
                stroke="#666"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Logout
          </button>

          {/* Settings */}
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">
            <Settings className="w-4 h-4" />
            Settings
          </button>

          {/* Help Desk */}
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
              <rect
                x="3"
                y="3"
                width="12"
                height="12"
                rx="2"
                stroke="#666"
                strokeWidth="1.5"
              />
              <path
                d="M6 9h6"
                stroke="#666"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Help Desk
          </button>

          {/* User Info */}
          <div className="flex items-center gap-2 p-2 rounded bg-[#F1F6FF]">
            <Image
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="User"
              width={32}
              height={32}
              className="rounded-full"
            />
            <div>
              <div className="text-sm font-semibold text-gray-800">
                Ravindra Dhage
              </div>
              <div className="text-xs text-gray-500">Interaction Designer</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
