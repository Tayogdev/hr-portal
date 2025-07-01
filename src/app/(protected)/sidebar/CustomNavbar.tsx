'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

type NavItem = {
  name: string;
  href: string;
  icon: React.JSX.Element;
};

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <rect width="20" height="20" rx="4" fill="#F3F4F6" />
        <path d="M6 6h8v8H6V6z" fill="#666" />
      </svg>
    ),
  },
  {
    name: 'Job listing',
    href: '/job-listing',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <rect width="20" height="20" rx="4" fill="#F3F4F6" />
        <path d="M5 7h10v2H5V7zm0 4h10v2H5v-2z" fill="#666" />
      </svg>
    ),
  },
  {
    name: 'All applicants',
    href: '/all-applicants',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <rect width="20" height="20" rx="4" fill="#F3F4F6" />
        <path
          d="M10 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
          fill="#666"
        />
      </svg>
    ),
  },
  {
    name: 'Company profile',
    href: '/company-profile',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <rect width="20" height="20" rx="4" fill="#F3F4F6" />
        <path
          d="M4 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"
          stroke="#666"
          strokeWidth="1.5"
        />
        <rect x="4" y="8" width="12" height="8" rx="2" fill="#666" />
      </svg>
    ),
  },
  {
    name: 'Schedule',
    href: '/schedule',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <rect width="20" height="20" rx="4" fill="#F3F4F6" />
        <path d="M6 8h8v2H6V8zm0 4h5v2H6v-2z" fill="#666" />
      </svg>
    ),
  },
];

export default function CustomNavbar(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-56 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex md:flex-col flex-row justify-between py-2 md:py-4 min-h-fit md:min-h-screen">
      {/* Sidebar Top */}
      <div className="flex-1 flex flex-row md:flex-col items-center md:items-stretch">
        {/* Logo */}
        <div className="flex items-center justify-center px-4 md:px-6 py-2 md:mb-10">
          <Image
            src="https://www.tayog.in/assets/logo/full_blue.svg"
            alt="tayog logo"
            width={110}
            height={28}
            className="md:w-[124px] md:h-[32px] w-[110px] h-[28px]"
          />
        </div>

        {/* Navigation */}
        <nav className="flex flex-row md:flex-col gap-1 flex-1 justify-center md:justify-start">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                href={item.href}
                key={item.name}
                className={`flex items-center px-4 md:px-6 py-2 text-base font-medium rounded-l-full md:rounded-l-full rounded-t-full transition-colors duration-150 ${
                  isActive ? 'bg-[#F1F6FF] text-[#4F8FF0]' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Bottom - Settings / Logout / User */}
      <div className="hidden md:flex flex-col gap-2 px-4 mb-2">
        {/* Logout Button */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
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
          <span className="text-sm">Logout</span>
        </button>

        {/* Help Button */}
        <button className="flex items-center gap-2 px-2 py-1 text-gray-600 hover:bg-gray-100 rounded">
          <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
            <rect x="3" y="3" width="12" height="12" rx="2" stroke="#666" strokeWidth="1.5" />
            <path d="M6 9h6" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-sm">Help desk</span>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-2 mt-2 p-2 rounded bg-[#F1F6FF]">
          <Image
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="User"
            width={32}
            height={32}
            className="rounded-full"
          />
          <div>
            <div className="text-sm font-semibold text-gray-800">Ravindra Dhage</div>
            <div className="text-xs text-gray-500">Interaction Designer</div>
          </div>
        </div>
      </div>
    </aside>  
  );
}
