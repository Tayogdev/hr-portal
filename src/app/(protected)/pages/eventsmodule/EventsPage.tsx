'use client'; 

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLoading } from '@/components/LoadingProvider';
import { usePageContext } from '@/components/PageContext';

// Defining the structure of an Event using TypeScript interface
interface Event {
  id: string;
  eventName: string;         // Name of the event
  status: 'Live' | 'Closed'; // Status of the event
  eventType: string;         // Type: Workshop, Webinar, etc.
  postedOn: string;          // When the event was posted
  dueDate: string;           // Deadline to register
  totalRegistration: number; // Number of people registered
  active: boolean;
}

export default function Events(): React.JSX.Element {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { selectedPageId, setSelectedPageId } = usePageContext();
  const { startLoading, stopLoading } = useLoading();
  
  // Get pageId from URL params first, then from context
  const urlPageId = searchParams.get('pageId');
  const pageId = urlPageId || selectedPageId;
  
  const [eventList, setEventList] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage] = useState(1);
  const [currentPageName, setCurrentPageName] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchEvents = useCallback(async (page: number) => {
    if (!session || !pageId || isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      startLoading();
      setError(null);

      const apiUrl = new URL('/api/events', window.location.origin);
      apiUrl.searchParams.set('page', page.toString());
      apiUrl.searchParams.set('limit', '10');
      apiUrl.searchParams.set('pageId', pageId);
      apiUrl.searchParams.set('_t', Date.now().toString());

      const response = await fetch(apiUrl.toString(), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch events (${response.status})`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setEventList(result.data.events || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
      setEventList([]);
    } finally {
      setLoading(false);
      stopLoading();
      isFetchingRef.current = false;
    }
  }, [session, pageId, startLoading, stopLoading]);

  // Cleanup loading state on unmount
  useEffect(() => {
    return () => {
      stopLoading();
    };
  }, [stopLoading]);

  // Auto-redirect to stored pageId if none in URL
  useEffect(() => {
    if (!urlPageId && selectedPageId) {
      router.replace(`/events?pageId=${selectedPageId}`);
    }
  }, [urlPageId, selectedPageId, router]);

  // Update context when pageId changes
  useEffect(() => {
    if (urlPageId && urlPageId !== selectedPageId) {
      setSelectedPageId(urlPageId);
    }
  }, [urlPageId, selectedPageId, setSelectedPageId]);

  // Fetch page name
  useEffect(() => {
    if (!pageId) {
      setCurrentPageName(null);
      return;
    }

    const cachedName = sessionStorage.getItem(`pageName_${pageId}`);
    if (cachedName) {
      setCurrentPageName(cachedName);
      return;
    }

    fetch(`/api/pages/${pageId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.page) {
          setCurrentPageName(data.page.title);
          sessionStorage.setItem(`pageName_${pageId}`, data.page.title);
        }
      })
      .catch(() => {
        // Set a fallback name if API fails
        setCurrentPageName('Events');
      });
  }, [pageId]);

  // Fetch events when dependencies change
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    if (session && pageId) {
      setEventList([]);
      setLoading(true);
      setError(null);
      
      // Add a small delay to prevent rapid successive calls
      timeoutId = setTimeout(() => {
        if (!isMounted) return;
        
        // Call fetchEvents directly instead of including it in dependencies
        fetchEvents(currentPage).then(() => {
          if (!isMounted) return;
        }).catch(() => {
          if (!isMounted) return;
          // Silent error handling for production
        });
      }, 100);
    } else if (session && !pageId) {
      setEventList([]);
      setLoading(false);
      setError(null);
    }
    
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentPage, session, pageId]); // Removed fetchEvents to prevent infinite loops

  if (loading) {
    return (
      <div className="p-8 bg-[#F8F9FC] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading events...</p>
          {currentPageName && <p className="text-sm text-gray-500 mt-2">for {currentPageName}</p>}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-[#F8F9FC] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => fetchEvents(currentPage)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!pageId) {
    return (
      <div className="p-8 bg-[#F8F9FC] min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎫</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Page Selected</h2>
          <p className="text-gray-600 mb-6">Please select a page from the sidebar to view events.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">💡 <strong>Tip:</strong> Click the &quot;Switch&quot; button in the header.</p>
          </div>
        </div>
      </div>
    );
  }

  if (eventList.length === 0 && !loading) {
    return (
      <div className="p-8 bg-[#F8F9FC] min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎫</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Events Found</h2>
          <p className="text-gray-600 mb-4">
            {currentPageName ? `No events found for ${currentPageName}.` : "No events found."}
          </p>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={() => fetchEvents(currentPage)} 
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Refresh
            </button>
            <button 
              onClick={() => window.location.href = '/events'}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Select Different Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-[#F8F9FC] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold mb-1">
            Events
            {currentPageName && <span className="text-lg text-blue-600 ml-2">- {currentPageName}</span>}
          </h1>
          <p className="text-gray-500 text-sm">
            Here are your events from {new Date().toLocaleDateString('en-GB')} to {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
          </p>
          {session?.user && (
            <p className="text-sm text-blue-600 mt-1">Showing events for: {session.user.email}</p>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full overflow-x-auto rounded-xl shadow bg-white">
        <div className="min-w-[800px] w-full">
          {/* Table Header */}
          <div className="bg-[#4A5568] text-white px-6 py-4">
            <div className="grid grid-cols-7 gap-4">
              {['Event Name', 'Status', 'Event Type', 'Posted on', 'Due Date', 'Registrations', 'Action'].map((header) => (
                <div key={header} className="font-medium">{header}</div>
              ))}
            </div>
          </div>
          
          {/* Table Rows */}
          {eventList.map((event, index) => (
            <div key={index} className="border-b last:border-0 px-6 py-4 hover:bg-gray-50">
              <div className="grid grid-cols-7 gap-4 items-center">
                {/* Event Name with Logo */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <img
                    src="/job-icon.png"
                    alt="Event Logo"
                    className="w-8 h-8 object-contain"
                  />
                  <span className="font-medium">{event.eventName}</span>
                </div>

                {/* Status */}
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    event.status === 'Live' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {event.status}
                  </span>
                </div>

                {/* Event Type */}
                <div className="text-gray-600">{event.eventType}</div>

                {/* Posted On */}
                <div className="text-gray-600">{event.postedOn}</div>

                {/* Due Date */}
                <div className="text-gray-600">{event.dueDate}</div>

                {/* Registrations */}
                <div className="text-gray-600">{event.totalRegistration}</div>

                {/* Action */}
                <div>
                  {event.status === 'Closed' ? (
                    <button className="bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs px-3 py-1.5 rounded-full transition-colors">
                      Closed
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        router.push(`/events/${event.id}`);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-full transition-colors"
                    >
                      Review Applicants
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}