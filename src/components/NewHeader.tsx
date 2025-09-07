'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Bell, Loader2, Menu, X, ChevronRight, ChevronDown, ArrowLeftRight, FileText } from 'lucide-react';
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
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function NewHeader({ currentView, sidebarOpen, setSidebarOpen }: HeaderProps): React.JSX.Element | null {
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
  const [loadingEventTitle, setLoadingEventTitle] = useState(false);
  const [postDropdownOpen, setPostDropdownOpen] = useState(false);
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
  

  const handleViewChange = async (page: Page) => {
    try {
      setLoadingPageId(page.id);
      startLoading();
      
      // Update session first to prevent page reload
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
      
      // Update URL without navigation to prevent reload
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('pageId', page.id);
      window.history.pushState({}, '', newUrl.pathname + newUrl.search);
      
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
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
    // Enhanced loading skeleton with better UX
    return (
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 fixed top-0 z-30 shadow-sm w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Hamburger skeleton */}
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            
            {/* Logo skeleton */}
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
            
            {/* Breadcrumb skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              <span className="text-gray-300">&gt;</span>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Bell skeleton */}
            <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse"></div>
            
            {/* Post New skeleton */}
            <div className="w-24 sm:w-32 h-9 bg-gray-200 rounded-full animate-pulse"></div>
            
            {/* Switch Page skeleton */}
            <div className="w-28 sm:w-36 h-9 bg-gray-200 rounded-full animate-pulse"></div>
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
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 fixed top-0 z-30 shadow-sm w-full">
      <div className="flex items-center justify-between">
        
        {/* Left section: Hamburger + Logo + Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          {/* Hamburger Menu */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <img
              src="https://www.tayog.in/assets/logo/full_blue.svg"
              alt="Tayog Logo"
              className="h-8 w-auto"
            />
          </div>

          {/* Breadcrumbs - positioned after logo */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center ml-4 lg:ml-6 flex-1 min-w-0"
          >
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                )}
                {index === breadcrumbs.length - 1 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {crumb.title}
                    </span>
                    {(isJobDetailPage && loadingJobTitle) ||
                    (isEventDetailPage && loadingEventTitle) ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    ) : null}
                  </div>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
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

          {/* Post a new Event */}
          <div className="relative post-dropdown">
            <button
              onClick={() => setPostDropdownOpen(!postDropdownOpen)}
              className="flex items-center gap-1 sm:gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Post a new Event</span>
              <span className="sm:hidden">+</span>
            </button>
            {postDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
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
                <ArrowLeftRight className="w-4 h-4" />
                <span className="hidden sm:inline">Switch Page</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[350px]">
              <SheetHeader>
                <SheetTitle>Switch Page</SheetTitle>
                <SheetDescription>
                  Select a page to switch to
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6">
                {loadingPages ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
                        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : pages.length > 0 ? (
                  <div className="space-y-2">
                    {pages.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => {
                          handleViewChange(page);
                          setSheetOpen(false);
                        }}
                        disabled={loadingPageId === page.id}
                        className={`
                          w-full flex items-center gap-3 p-3 text-left rounded-lg border transition-all duration-200
                          ${loadingPageId === page.id 
                            ? 'border-blue-200 bg-blue-50 cursor-not-allowed' 
                            : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                          }
                        `}
                      >
                        {loadingPageId === page.id ? (
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          </div>
                        ) : page.logo ? (
                          <img
                            src={page.logo}
                            alt={page.title}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-700">
                              {page.title.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium truncate ${
                            loadingPageId === page.id ? 'text-blue-700' : 'text-gray-900'
                          }`}>
                            {page.title}
                          </div>
                          <div className={`text-sm truncate ${
                            loadingPageId === page.id ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            {loadingPageId === page.id ? 'Switching...' : page.type}
                          </div>
                        </div>
                        {loadingPageId === page.id && (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse"></div>
                            <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="text-lg font-medium text-gray-900 mb-2">No pages available</div>
                    <div className="text-sm text-gray-500 max-w-sm mx-auto">
                      You don't have access to any pages yet. Contact your administrator to get access.
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
