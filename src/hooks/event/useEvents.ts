import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useLoading } from "@/components/LoadingProvider";
import { Event } from "../../types/event/types";

interface UseEventsReturn {
  eventList: Event[];
  loading: boolean;
  error: string | null;
  fetchEvents: (page: number) => Promise<void>;
  refetch: () => void;
}

export function useEvents(pageId: string | null): UseEventsReturn {
  const { data: session } = useSession();
  const { startLoading, stopLoading } = useLoading();

  const [eventList, setEventList] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage] = useState(1);
  const isFetchingRef = useRef(false);

  const fetchEvents = useCallback(
    async (page: number) => {
      if (!session || !pageId || isFetchingRef.current) return;

      try {
        isFetchingRef.current = true;
        setLoading(true);
        setError(null);

        const apiUrl = new URL("/api/events", window.location.origin);
        apiUrl.searchParams.set("page", page.toString());
        apiUrl.searchParams.set("limit", "10");
        apiUrl.searchParams.set("pageId", pageId);
        apiUrl.searchParams.set("_t", Date.now().toString());

        const response = await fetch(apiUrl.toString(), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch events (${response.status})`);
        }

        const result = await response.json();
        if (result.success && result.data) {
          setEventList(result.data.events || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load events");
        setEventList([]);
      } finally {
        setLoading(false);
        stopLoading();
        isFetchingRef.current = false;
      }
    },
    [session, pageId, startLoading, stopLoading]
  );

  const refetch = useCallback(() => {
    fetchEvents(currentPage);
  }, [fetchEvents, currentPage]);

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

        fetchEvents(currentPage).catch(() => {
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

  return {
    eventList,
    loading,
    error,
    fetchEvents,
    refetch,
  };
}
