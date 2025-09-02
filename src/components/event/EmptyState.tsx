import React from "react";
import { Loader2 } from "lucide-react";

interface EmptyStateProps {
  type: "no-page" | "no-events";
  currentPageName?: string | null;
  onRefresh?: () => void;
  loading?: boolean;
}

export function EmptyState({
  type,
  currentPageName,
  onRefresh,
  loading = false,
}: EmptyStateProps): React.JSX.Element {
  if (type === "no-page") {
    return (
      <div className="p-8 bg-[#F8F9FC] min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎫</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            No Page Selected
          </h2>
          <p className="text-gray-600 mb-6">
            Please select a page from the sidebar to view events.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              💡 <strong>Tip:</strong> Click the &quot;Switch&quot; button in
              the header.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#F8F9FC] min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🎫</div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          No Events Found
        </h2>
        <p className="text-gray-600 mb-4">
          {currentPageName
            ? `No events found for ${currentPageName}.`
            : "No events found."}
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Refresh
          </button>
          <button
            onClick={() => (window.location.href = "/events")}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Select Different Page
          </button>
        </div>
      </div>
    </div>
  );
}
