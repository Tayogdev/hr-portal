import React from "react";
import { Loader2 } from "lucide-react";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { EventsHeader } from "./EventsHeader";

interface LoadingStateProps {
  currentPageName?: string | null;
  userEmail?: string;
}

export function LoadingState({
  currentPageName,
  userEmail,
}: LoadingStateProps): React.JSX.Element {
  return (
    <div className="p-4 sm:p-6 md:p-8 bg-[#F8F9FC] min-h-screen">
      {/* Header */}
      <EventsHeader
        currentPageName={currentPageName}
        userEmail={userEmail}
        loading={true}
      />

      {/* Loading State - Inline */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-blue-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading events...</span>
        </div>
      </div>

      {/* Table Skeleton */}
      <TableSkeleton rows={8} />
    </div>
  );
}
