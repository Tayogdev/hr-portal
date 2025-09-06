'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Bell, Loader2 } from 'lucide-react';
import { useLoading } from '@/components/LoadingProvider';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ViewAs } from '@/types/auth-interface';
import CustomSidebar from "@/components/CustomSidebar"; // import कर


interface Page {
  id: string;
  logo?: string | null;
  title: string;
  uName: string;
  type: string;
}

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
  'events': 'Events',
};

interface HeaderProps {
  currentView?: ViewAs;
}

export default function Header({ currentView }: HeaderProps): React.JSX.Element | null {
  const { update, data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();

    const [sidebarOpen, setSidebarOpen] = useState(false);

  // Direct API call for pages data
  const [pages, setPages] = useState<any[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);

  const [currentJobTitle, setCurrentJobTitle] = useState<string | null>(null);
  const [loadingJobTitle, setLoadingJobTitle] = useState<boolean>(false);
  const [currentEventTitle, setCurrentEventTitle] = useState<string | null>(null);
  const [loadingEventTitle, setLoadingEventTitle] = useState<boolean>(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loadingPageId, setLoadingPageId] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoadingPages(true);
      const response = await fetch('/api/pages');
      const data = await response.json();
      if (data.success) {
        setPages(data.pages || []);
      } else {
        setPages([]);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      setPages([]);
    } finally {
      setLoadingPages(false);
    }
  }, [session?.user?.id]);

  // Fetch pages when session changes
  useEffect(() => {
    fetchPages();
  }, [fetchPages]);
  const [postDropdownOpen, setPostDropdownOpen] = useState(false);

  const handleViewChange = async (page: Page) => {
    try {
      setLoadingPageId(page.id);
      startLoading();
      
      // Update URL first for immediate feedback
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('pageId', page.id);
      router.push(newUrl.pathname + newUrl.search);
      
      // Update session without reloading
      await update({
        ...session,
        view: {
          name: page.title,
          uName: page.uName,
          logo: page.logo,
          type: page.type,
          id: page.id,
        },
      });
      
      setLoadingPageId(null);
      stopLoading();
    } catch (error) {
      console.error("Error updating session:", error);
      setLoadingPageId(null);
      stopLoading();
    }
  };


  useEffect(() => {
    const jobDetailPathMatch = pathname.match(/^\/job-listing\/([^/]+)/);
    if (jobDetailPathMatch && jobDetailPathMatch[1] !== 'new') {
      const jobId = jobDetailPathMatch[1];

      const fetchJobTitle = async () => {
        try {
          setLoadingJobTitle(true);
          const res = await fetch(`/api/opportunities/${jobId}`);
          const result = await res.json();

          if (res.ok && result.success && result.data?.role) {
            setCurrentJobTitle(result.data.role);
          } else {
            setCurrentJobTitle('Job Details');
          }
        } catch {
          setCurrentJobTitle('Job Details');
        } finally {
          setLoadingJobTitle(false);
        }
      };

      fetchJobTitle();
    } else {
      setCurrentJobTitle(null);
      setLoadingJobTitle(false);
    }
  }, [pathname]);

  // Fetch event title for event detail pages
  useEffect(() => {
    const eventDetailPathMatch = pathname.match(/^\/events\/([^/]+)/);
    if (eventDetailPathMatch) {
      const eventId = eventDetailPathMatch[1];

      // Only fetch if we don't already have the title for this event
      if (currentEventTitle === null || !currentEventTitle.includes(eventId)) {
        const fetchEventTitle = async () => {
          try {
            setLoadingEventTitle(true);
            const res = await fetch(`/api/events/${eventId}`);
            const result = await res.json();

            if (res.ok && result.success && result.data?.title) {
              setCurrentEventTitle(result.data.title);
            } else {
              setCurrentEventTitle('Event Details');
            }
          } catch {
            setCurrentEventTitle('Event Details');
          } finally {
            setLoadingEventTitle(false);
          }
        };

        fetchEventTitle();
      }
    } else {
      setCurrentEventTitle(null);
      setLoadingEventTitle(false);
    }
  }, [pathname, currentEventTitle]);

  // Reset loading state when pathname changes
  useEffect(() => {
    setLoadingPageId(null);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.post-dropdown')) {
        setPostDropdownOpen(false);
      }
    };

    if (postDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [postDropdownOpen]);


  if (status === 'loading' || !session) {
    // Show loading skeleton instead of null
    return (
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-24 h-9 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-32 h-9 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  const hiddenRoutes = ['/login', '/register'];
  if (hiddenRoutes.includes(pathname)) return null;

  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: { title: string; href: string }[] = [];
    let currentPath = '';

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;

      let title = routeSegmentMap[segment] || decodeURIComponent(segment);

      const isJobDetail = segments[0] === 'job-listing' && i === 1;
      const isEventDetail = segments[0] === 'events' && i === 1;

      if (isJobDetail && currentJobTitle) {
        title = currentJobTitle;
      } else if (isEventDetail && currentEventTitle) {
        title = currentEventTitle;
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
  const isJobDetailPage = pathname.startsWith('/job-listing/') && pathname.split('/').length === 3;
  const isEventDetailPage = pathname.startsWith('/events/') && pathname.split('/').length === 3;

  return (

      <>
    {/* Sidebar */}
    <CustomSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

<header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-30 shadow-sm">
  <div className="flex items-center justify-between">
    
    {/* Left section: Hamburger + Breadcrumb */}
    <div className="flex items-center gap-2 sm:gap-4">
      {/* Hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto max-w-[70vw] sm:max-w-none"
      >
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            {index > 0 && (
              <span className="text-gray-400 text-sm sm:text-lg mx-1">&gt;</span>
            )}
            {index === breadcrumbs.length - 1 ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <h1 className="text-sm sm:text-lg text-gray-600 truncate max-w-[120px] sm:max-w-none">
                  {crumb.title}
                </h1>
                {(isJobDetailPage && loadingJobTitle) ||
                (isEventDetailPage && loadingEventTitle) ? (
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-blue-600" />
                ) : null}
              </div>
            ) : (
              <Link
                href={crumb.href}
                className="text-sm sm:text-lg text-gray-600 hover:text-gray-800 transition-colors truncate max-w-[80px] sm:max-w-none"
              >
                {crumb.title}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>
    </div>

    {/* Right section: Actions */}
    <div className="flex items-center gap-2 sm:gap-4">
      {/* Bell */}
      <button
        className="relative rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center w-9 h-9"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">
          1
        </span>
      </button>

      {/* Post New */}
      <div className="relative post-dropdown">
        <button
          onClick={() => setPostDropdownOpen(!postDropdownOpen)}
          className="flex items-center gap-1 sm:gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
        >
          <span className="hidden sm:inline">Post New</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {postDropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="py-1">
              <button
                onClick={() => {
                  setPostDropdownOpen(false);
                  alert('Job creation coming soon!');
                }}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Post Job
              </button>
              <button
                onClick={() => {
                  setPostDropdownOpen(false);
                  alert('Event creation coming soon!');
                }}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Post Event
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Switch Sidebar */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <button className="flex items-center gap-1 sm:gap-2 bg-white text-gray-800 border border-gray-300 px-3 sm:px-4 py-2 rounded-full hover:bg-gray-100 transition-colors font-medium text-sm sm:text-base">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            <span className="hidden sm:inline">Switch Page</span>
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:w-[350px]">
          {/* Switch content same as your code */}
        </SheetContent>
      </Sheet>
    </div>
  </div>
</header>

</>

  );
}
