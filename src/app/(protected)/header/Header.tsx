'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Bell, Plus, Loader2 } from 'lucide-react';
import { useLoading } from '@/components/LoadingProvider';

type Page = {
  id: string;
  title: string;
  uName: string;
  logo?: string;
  type: string;
};

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

export default function Header(): React.JSX.Element | null {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { startLoading } = useLoading();

  const [currentJobTitle, setCurrentJobTitle] = useState<string | null>(null);
  const [loadingJobTitle, setLoadingJobTitle] = useState<boolean>(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loadingPageId, setLoadingPageId] = useState<string | null>(null);

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

  // Reset loading state when pathname changes
  useEffect(() => {
    setLoadingPageId(null);
  }, [pathname]);

  // Fetch pages on mount with caching
  useEffect(() => {
    const fetchPages = async () => {
      try {
        // Check if we already have pages cached
        const cachedPages = sessionStorage.getItem('cachedPages');
        const cacheTime = sessionStorage.getItem('cachedPagesTime');
        const now = Date.now();
        
        // Use cache if it's less than 5 minutes old
        if (cachedPages && cacheTime && (now - parseInt(cacheTime)) < 5 * 60 * 1000) {
          setPages(JSON.parse(cachedPages));
          setLoadingPages(false);
          return;
        }

        const res = await fetch('/api/pages');
        const data = await res.json();
        if (data.success) {
          setPages(data.pages);
          // Cache the pages for 5 minutes
          sessionStorage.setItem('cachedPages', JSON.stringify(data.pages));
          sessionStorage.setItem('cachedPagesTime', now.toString());
        }
      } catch {
        // Silently handle page fetch error
      } finally {
        setLoadingPages(false);
      }
    };

    fetchPages();
  }, []);

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

      let title = routeSegmentMap[segment] || decodeURIComponent(segment);

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
          {/* Bell */}
          <button className="relative p-0 rounded-full hover:bg-gray-100 transition-colors" aria-label="Notifications">
            <div className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center">
              <Bell className="w-5 h-5 text-gray-600" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
          </button>

          {/* Post Job/Event */}
          {(pathname === '/dashboard' || pathname.startsWith('/job-listing')) && (
            <Link href="/job-listing/new" passHref>
              <button className="flex items-center gap-2 bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-full hover:bg-blue-50 transition-colors font-medium">
                Post a New Job
                <Plus className="w-4 h-4" />
              </button>
            </Link>
          )}

          {/* Switch Sidebar */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button className="flex items-center gap-2 bg-white text-gray-800 border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors font-medium" >
                Switch
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle className="text-base">Switch Page</SheetTitle>
                <SheetDescription>Choose a page to switch to:</SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-2">
                {loadingPages ? (
                  <p className="text-sm text-gray-500">Loading pages...</p>
                ) : pages.length === 0 ? (
                  <p className="text-sm text-gray-500">No pages available.</p>
                ) : (
                  pages.map((page) => (
                    <button
                      key={page.id}
                      onClick={async () => {
                        setLoadingPageId(page.id);
                        startLoading();
                        setSheetOpen(false); // Close sheet immediately
                        
                        // Route to appropriate page based on current path
                        if (pathname.startsWith('/events')) {
                          router.push(`/events?pageId=${page.id}`);
                        } else {
                          router.push(`/job-listing?pageId=${page.id}`);
                        }
                      }}
                      disabled={loadingPageId === page.id}
                      className="block w-full text-left bg-gray-100 px-3 py-2 rounded hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{page.title}</div>
                          <div className="text-xs text-gray-500 truncate">/{page.uName}</div>
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

          {/* Post Event */}
          {pathname === '/events' && (
            <button
              onClick={() => {}}
              className="flex items-center gap-2 bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-full hover:bg-blue-50 transition-colors font-medium"
            >
              Post a new Event
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
