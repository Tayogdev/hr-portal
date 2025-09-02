'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Bell, Loader2 } from 'lucide-react';
import { useLoading } from '@/components/LoadingProvider';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ViewAs } from '@/types/auth-interface';

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
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                {index > 0 && <span className="text-gray-400 text-lg mx-1">&gt;</span>}
                {index === breadcrumbs.length - 1 ? (
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg text-gray-600">{crumb.title}</h1>
                    {(isJobDetailPage && loadingJobTitle) || (isEventDetailPage && loadingEventTitle) ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    ) : null}
                  </div>
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
          {/* Bell */}
          <button className="relative p-0 rounded-full hover:bg-gray-100 transition-colors" aria-label="Notifications">
            <div className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center">
              <Bell className="w-5 h-5 text-gray-600" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
          </button>

          {/* Unified Post Button with Dropdown */}
          <div className="relative post-dropdown">
            <button 
              onClick={() => setPostDropdownOpen(!postDropdownOpen)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium"
            >
              Post New
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {postDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setPostDropdownOpen(false);
                      // TODO: Implement job creation
                      alert('Job creation feature coming soon!');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                Post a New Job
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setPostDropdownOpen(false);
                      // TODO: Implement event creation
                      alert('Event creation feature coming soon!');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      Post a New Event
                    </div>
              </button>
                </div>
              </div>
          )}
          </div>

          {/* Switch Sidebar */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button className="flex items-center gap-2 bg-white text-gray-800 border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors font-medium" >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Switch Page
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle className="text-base">Switch Organization Page</SheetTitle>
                <SheetDescription>
                  Choose a different organization to view their opportunities and events:
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-2">
                {loadingPages ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-sm text-gray-600">Loading organizations...</span>
                  </div>
                ) : !pages || pages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">No organizations available.</p>
                    <p className="text-xs text-gray-400 mt-1">Create an organization first to get started.</p>
                  </div>
                ) : (
                  (pages || []).map((page: { id: string; title: string; uName: string; logo?: string; type: string }) => (
                    <button
                      key={page.id}
                      onClick={async () => {
                        setLoadingPageId(page.id);
                        startLoading();
                        handleViewChange(page);
                        setSheetOpen(false);
                      }}
                      disabled={loadingPageId === page.id}
                      className={`block w-full text-left border px-4 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                        currentView?.id === page.id 
                          ? 'bg-blue-50 border-blue-200 text-blue-900' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600">
                              {page.title.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        <div>
                            <div className="text-sm font-medium text-gray-900">{page.title}</div>
                            <div className="text-xs text-gray-500">@{page.uName}</div>
                          </div>
                        </div>
                        {loadingPageId === page.id && (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
