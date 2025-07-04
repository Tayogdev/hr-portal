'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Bell } from 'lucide-react';

const routeTitleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/job-listing': 'Job Listing',
  '/job-listing/new': 'Post a New Job',
  '/company-profile': 'Company Profile',
  '/schedule': 'Schedule',
  '/all-applicants': 'All Applicants',
};

export default function Header(): React.JSX.Element | null {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === 'loading' || !session) return null;

  const hiddenRoutes = ['/login', '/register'];
  if (hiddenRoutes.includes(pathname)) return null;

  const basePath = `/${pathname.split('/')[1]}`;
  const pageTitle = routeTitleMap[pathname] || routeTitleMap[basePath] || 'Page';

  return (
    <header className="w-full bg-white border-b border-gray-200 px-4 sm:px-6 md:px-8 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Page Title */}
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          {pageTitle}
        </h1>

        {/* Notification + Post Job */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {(pathname === '/dashboard' || pathname.startsWith('/job-listing')) && (
            <Link href="/job-listing/new">
              <button className="flex items-center gap-2 bg-[#4F8FF0] text-white px-4 py-2 rounded-md hover:bg-[#3B77D3] transition text-sm whitespace-nowrap">
                <span className="text-lg font-bold">+</span>
                <span className="font-medium">Post a New Job</span>
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
