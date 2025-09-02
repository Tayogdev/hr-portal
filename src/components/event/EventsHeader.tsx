import React from "react";
import { EventsPageProps } from "../../types/event/types";

interface EventsHeaderProps extends EventsPageProps {
  loading?: boolean;
}

export function EventsHeader({
  currentPageName,
  userEmail,
  loading = false,
}: EventsHeaderProps): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold mb-1">
          Events
          {currentPageName && (
            <span className="text-lg text-blue-600 ml-2">
              - {currentPageName}
            </span>
          )}
        </h1>
        <p className="text-gray-500 text-sm">
          Here are your events from {new Date().toLocaleDateString("en-GB")} to{" "}
          {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
            "en-GB"
          )}
        </p>
        {userEmail && (
          <p className="text-sm text-blue-600 mt-1">
            Showing events for: {userEmail}
          </p>
        )}
      </div>
    </div>
  );
}
