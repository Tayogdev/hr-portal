'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Bell, Plus } from 'lucide-react';

const routeTitleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/job-listing': 'Job Listing',
  '/job-listing/new': 'Post a New Job',
  '/organization': 'Organization',
  '/schedule': 'Schedule',
  '/all-applicants': 'All Applicants',
  '/company-profile': 'Company Profile',
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
  let pageTitle = 'Dashboard';
  
  // Check for exact matches first
  if (routeTitleMap[pathname]) {
    pageTitle = routeTitleMap[pathname];
  } else {
    // Check for partial matches (for dynamic routes)
    const matchedRoute = Object.keys(routeTitleMap).find(route => 
      pathname.startsWith(route) && route !== '/'
    );
    if (matchedRoute) {
      pageTitle = routeTitleMap[matchedRoute];
    }
  }

  // Special handling for job detail pages
  if (pathname.includes('/job-listing/') && pathname !== '/job-listing') {
    pageTitle = 'Job Details';
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {pageTitle}
          </h1>
          {pathname.includes('/job-listing/') && pathname !== '/job-listing' && (
            <p className="text-sm text-gray-500 mt-1">
              Manage applicants and review submissions
            </p>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notification Button */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">1</span>
            </span>
          </button>

          {/* Post a New Job Button */}
          {(pathname === '/dashboard' || pathname.startsWith('/job-listing')) && (
            <Link href="/job-listing/new">
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <Plus className="w-4 h-4" />
                Post a New Job
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}