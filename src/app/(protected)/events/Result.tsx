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

  // Handle loading state
  if (loading) {
    return (
      <LoadingState
        currentPageName={currentPageName}
        userEmail={session?.user?.email}
      />
    );
  }

  // Handle error state
  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  // Handle no page selected
  if (!pageId) {
    return <EmptyState type="no-page" />;
  }

  // Handle no events found
  if (eventList.length === 0) {
    return (
      <EmptyState
        type="no-events"
        currentPageName={currentPageName}
        onRefresh={refetch}
        loading={loading}
      />
    );
  }

  // Main events display
  return (
    <div className="p-4 sm:p-6 md:p-8 bg-[#F8F9FC] min-h-screen">
      <EventsHeader
        currentPageName={currentPageName}
        userEmail={session?.user?.email}
      />
      <EventsTable events={eventList} />
    </div>
  );
}
