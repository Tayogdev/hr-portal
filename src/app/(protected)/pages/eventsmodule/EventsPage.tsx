'use client'; 

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLoading } from '@/components/LoadingProvider';

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
  const pageId = searchParams.get('pageId');
  const { startLoading, stopLoading } = useLoading();
  
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

  // Track which dropdown is open (only one at a time)
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

  // Ref to check clicks outside dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  // For routing to a dynamic event page (Review Applicants)
  const router = useRouter();

  // Close dropdown when user clicks outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownIndex(null); // Close the dropdown
      }
    };

    document.addEventListener('mousedown', handleClickOutside); // Add event listener
    return () => document.removeEventListener('mousedown', handleClickOutside); // Clean up
  }, []);

  // Function to update event status (Live <-> Closed)
  const updateStatus = (index: number, newStatus: 'Live' | 'Closed') => {
    const updated = [...eventList];        // Copy the event list
    updated[index].status = newStatus;     // Change the status
    setEventList(updated);                 // Update state
    setOpenDropdownIndex(null);            // Close dropdown
  };

  // Function to style the status button
  const getStatusClasses = (status: Event['status']) => {
    if (status === 'Live') {
      return 'border-green-300 text-gray-700 hover:bg-green-50';
    } else {
      return 'border-gray-300 text-gray-700 hover:bg-gray-50';
    }
  };

  // Function to get the status dot color
  const getDotClasses = (status: Event['status']) => {
    return status === 'Live' ? 'bg-green-500' : 'bg-transparent';
  };

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
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please select a page to view events</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {currentPageName ? `Events for ${currentPageName}` : 'Events'}
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-[#4F5B67] text-white text-xs sm:text-sm">
              <th className="py-3 px-4 text-left">Event Name</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Event Type</th>
              <th className="py-3 px-4 text-left">Posted On</th>
              <th className="py-3 px-4 text-left">Due Date</th>
              <th className="py-3 px-4 text-center">Registrations</th>
              <th className="py-3 px-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {eventList.map((event, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">

                {/* Event Name with Logo */}
                <td className="py-3 px-4 text-gray-700 whitespace-nowrap flex items-center">
                  <img
                    src="/job-icon.png"  // Logo from public folder
                    alt="Event Logo"
                    className="w-10 h-10 object-contain mr-3 flex-shrink-0"
                  />
                  <span className="text-sm sm:text-base">{event.eventName}</span>
                </td>

                {/* Status Button with Dropdown */}
                <td className="py-3 px-4 relative">
                  <div ref={openDropdownIndex === index ? dropdownRef : null}>
                    <button
                      onClick={() =>
                        setOpenDropdownIndex(openDropdownIndex === index ? null : index)
                      }
                      className={`px-3 py-1.5 border rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${getStatusClasses(event.status)}`}
                    >
                      {event.status === 'Live' && (
                        <span className={`w-2 h-2 rounded-full ${getDotClasses(event.status)}`}></span>
                      )}
                      {event.status}
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>

                    {/* Dropdown options */}
                    {openDropdownIndex === index && (
                      <div className="absolute mt-1 left-0 bg-white border border-gray-200 rounded-md shadow-md z-10 w-28">
                        {['Live', 'Closed'].map((statusOption) => (
                          <button
                            key={statusOption}
                            onClick={() => updateStatus(index, statusOption as 'Live' | 'Closed')}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                          >
                            {statusOption}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>

                {/* Other Table Data */}
                <td className="py-3 px-4 text-gray-700">{event.eventType}</td>
                <td className="py-3 px-4 text-gray-700">{event.postedOn}</td>
                <td className="py-3 px-4 text-gray-700">{event.dueDate}</td>
                <td className="py-3 px-4 text-gray-700 text-center">{event.totalRegistration}</td>

                {/* Action Button */}
                <td className="py-3 px-4 text-center">
                  {event.status === 'Closed' ? (
                    <button className="bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs sm:text-sm px-3 py-1.5 rounded-full transition-colors">
                      Closed
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        router.push(`/events/${event.id}`); // Redirect to event detail page using ID
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-3 py-1.5 rounded-full transition-colors"
                    >
                      Review Applicants
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}