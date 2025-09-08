"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useEvents } from "@/hooks/event/useEvents";
import { usePageNavigation } from "@/hooks/event/usePageNavigation";
import { usePageName } from "@/hooks/event/usePageName";
import { EventsHeader } from "@/components/event/EventsHeader";
import { EventsTable } from "@/components/event/EventsTable";
import { LoadingState } from "@/components/event/LoadingState";
import { ErrorState } from "@/components/event/ErrorState";
import { EmptyState } from "@/components/event/EmptyState";

export default function Events(): React.JSX.Element {
  const { data: session } = useSession();
  const { pageId } = usePageNavigation();
  const { currentPageName } = usePageName(pageId);
  const { eventList, loading, error, refetch } = useEvents(pageId);

  // Case 1: No page selected
  if (!pageId) {
    return <EmptyState type="no-page" />;
  }

  // Case 2: Loading state
  if (loading) {
    return (
      <LoadingState
        currentPageName={currentPageName}
        userEmail={session?.user?.email}
      />
    );
  }

  // Case 3: Error state
  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  // Case 4: No events found
  if (!eventList || eventList.length === 0) {
    return (
      <EmptyState
        type="no-events"
        currentPageName={currentPageName}
        onRefresh={refetch}
        loading={loading}
      />
    );
  }

  // Case 5: Show events
  return (
    <div className="w-full min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col ">
        <EventsHeader
          currentPageName={currentPageName}
          userEmail={session?.user?.email}
        />
        <EventsTable events={eventList} />
      </div>
    </div>
  );
}
