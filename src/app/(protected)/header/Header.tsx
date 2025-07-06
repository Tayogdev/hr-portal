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
  '/Organization': 'Organization', // Note: Typo here if it should be 'organization'
  '/schedule': 'Schedule',
  '/all-applicants': 'All Applicants',
  '/company-profile': 'Company Profile', // Added for completeness, if this route exists
};

export default function Header(): React.JSX.Element | null {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // If session is loading or no session, do not render the header
  if (status === 'loading' || !session) return null;

  // Routes where the header should not be displayed
  const hiddenRoutes = ['/login', '/register'];
  if (hiddenRoutes.includes(pathname)) return null;

  // Determine the page title based on the current path
  const basePath = `/${pathname.split('/')[1]}`; // e.g., converts "/job-listing/new" to "/job-listing"
  const pageTitle = routeTitleMap[pathname] || routeTitleMap[basePath] || 'Page';

  return (
    <header className="w-full bg-white border-b border-gray-200 px-4 sm:px-6 md:px-8 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Page Title */}
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          {pageTitle}
        </h1>

        {/* Notification & Post Job Button Section */}
        <div className="flex items-center gap-3">
          {/* Notification Button */}
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
            <Bell className="w-5 h-5 text-gray-600" />
            {/* Red dot for new notifications */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Post a New Job Button (conditional rendering) */}
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