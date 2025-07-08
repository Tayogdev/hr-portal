
// components/Header.tsx
'use client';

import React, { useState, useEffect } from 'react'; // Make sure useState and useEffect are imported
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { Bell, Plus } from 'lucide-react';

// Define a map for standard route segments
const routeSegmentMap: Record<string, string> = {
  'dashboard': 'Dashboard',
  'job-listing': 'Job Listing',
  'new': 'Post a New Job',
  'organization': 'Organization',
  'schedule': 'Schedule',
  'all-applicants': 'All Applicants',
  'company-profile': 'Company Profile',
  'applicants': 'Applicants',
  'shortlisted': 'Shortlisted Applicants',
};

// Mock Data for Job Titles (REPLACE WITH REAL DATA FETCHING)
const mockJobTitles: Record<string, string> = {
  'user-experience-designer': 'User Experience Designer',
  'software-engineer': 'Software Engineer (Frontend)',
  'product-manager': 'Product Manager',
};


export default function Header(): React.JSX.Element | null {
  // --- ALL HOOKS MUST BE DECLARED HERE, UNCONDITIONALLY, AT THE TOP LEVEL ---
  const { data: session, status } = useSession(); // Hook 1
  const pathname = usePathname(); // Hook 2

  // State to hold the dynamic job title
  const [currentJobTitle, setCurrentJobTitle] = useState<string | null>(null); // Hook 3

  // Effect to determine dynamic job title if on a job details page
  useEffect(() => { // Hook 4
    const jobDetailPathMatch = pathname.match(/^\/job-listing\/([^/]+)/);
    if (jobDetailPathMatch && jobDetailPathMatch[1] && jobDetailPathMatch[1] !== 'new') {
      const jobId = jobDetailPathMatch[1];
      // In a real application, you would fetch the job title using this jobId
      const title = mockJobTitles[jobId] || 'Job Details'; // Fallback title
      setCurrentJobTitle(title);
    } else {
      setCurrentJobTitle(null);
    }
  }, [pathname]);


  // --- CONDITIONAL RETURNS MUST COME AFTER ALL HOOKS ARE CALLED ---

  // If session is loading or no session, do not render the header
  if (status === 'loading' || !session) {
    return null;
  }

  // Routes where the header should not be displayed
  const hiddenRoutes = ['/login', '/register'];
  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  // --- Rest of your component logic and rendering ---

  // Function to generate breadcrumbs
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(segment => segment !== '');
    const breadcrumbs: { title: string; href: string }[] = [];
    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      let title = routeSegmentMap[segment] || segment;

      if (currentPath.startsWith('/job-listing/') && segment !== 'new') {
        const isJobIdSegment = index === 1 && segments[0] === 'job-listing';
        if (isJobIdSegment && currentJobTitle) {
          title = currentJobTitle;
        } else if (segments[0] === 'job-listing' && index > 1) {
            title = routeSegmentMap[segment] || segment;
        }
      }

      breadcrumbs.push({
        title: title,
        href: currentPath,
      });
    });

    if (pathname === '/') {
        return [{ title: 'Dashboard', href: '/dashboard' }];
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Breadcrumbs / Page Title */}
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                {index > 0 && (
                  <span className="text-gray-400 text-lg mx-1">&gt;</span>
                )}
                {index === breadcrumbs.length - 1 ? (
                  <h1 className="text-xl font-semibold text-gray-900 md:text-2xl">
                    {crumb.title}
                  </h1>
                ) : (
                  <Link href={crumb.href} className="text-lg text-gray-600 hover:text-gray-800 transition-colors">
                    {crumb.title}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>

       
        
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notification Button */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Notifications">
            <Bell className="w-5 h-5 text-gray-600" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold" aria-live="polite">
              1
            </span>
          </button>

          {/* Post a New Job Button */}
          {(pathname === '/dashboard' || pathname.startsWith('/job-listing')) && (
            <Link href="/job-listing/new" passHref>
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