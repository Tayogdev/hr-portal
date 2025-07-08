'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Bell, Plus } from 'lucide-react';

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

export default function Header(): React.JSX.Element | null {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const [currentJobTitle, setCurrentJobTitle] = useState<string | null>(null);
  const [loadingJobTitle, setLoadingJobTitle] = useState<boolean>(false);

  useEffect(() => {
    const jobDetailPathMatch = pathname.match(/^\/job-listing\/([^/]+)/);
    if (jobDetailPathMatch && jobDetailPathMatch[1] !== 'new') {
      const jobId = jobDetailPathMatch[1];

      const fetchJobTitle = async () => {
        try {
          setLoadingJobTitle(true); // Start loading
          const res = await fetch(`/api/opportunities/${jobId}`);
          const result = await res.json();

          if (res.ok && result.success && result.data?.role) {
            setCurrentJobTitle(result.data.role);
          } else {
            setCurrentJobTitle('Job Details');
          }
        } catch (err) {
          console.error('Failed to fetch job title:', err);
          setCurrentJobTitle('Job Details');
        } finally {
          setLoadingJobTitle(false); // Done loading
        }
      };

      fetchJobTitle();
    } else {
      setCurrentJobTitle(null);
      setLoadingJobTitle(false);
    }
  }, [pathname]);

  if (status === 'loading' || !session) return null;

  const hiddenRoutes = ['/login', '/register'];
  if (hiddenRoutes.includes(pathname)) return null;

  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: { title: string; href: string }[] = [];
    let currentPath = '';

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;

      let title = routeSegmentMap[segment] || segment;

      const isJobDetail = segments[0] === 'job-listing' && i === 1;

      if (isJobDetail && currentJobTitle) {
        title = currentJobTitle;
      }

      breadcrumbs.push({
        title,
        href: currentPath,
      });
    }

    if (pathname === '/') {
      return [{ title: 'Dashboard', href: '/dashboard' }];
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // ⛔ Prevent render during loading to avoid showing job ID
  const isJobDetailPage = pathname.startsWith('/job-listing/') && pathname.split('/').length === 3;
  if (isJobDetailPage && loadingJobTitle) return null;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                {index > 0 && <span className="text-gray-400 text-lg mx-1">&gt;</span>}
                {index === breadcrumbs.length - 1 ? (
                  <h1 className="text-lg text-gray-600">{crumb.title}</h1>
                ) : (
                  <Link href={crumb.href} className="text-lg text-gray-600 hover:text-gray-800 transition-colors">
                    {crumb.title}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Notifications">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
          </button>

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
