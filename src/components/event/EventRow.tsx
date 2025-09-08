import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Event } from "../../types/event/types";

interface EventRowProps {
  event: Event;
  index: number;
  isMobile?: boolean;
}

export function EventRow({ event, index, isMobile = false }: EventRowProps): React.JSX.Element {
  const router = useRouter();

  // Mobile view - just return the action button
  if (isMobile) {
    return (
      <div className="w-full">
        {event.status === "Closed" ? (
          <Button
            size="sm"
            disabled
            className="w-full bg-gray-300 text-gray-500 cursor-not-allowed text-sm px-4 py-2 rounded-full"
          >
            Closed
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => router.push(`/events/${event.id}`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2 rounded-full text-white"
          >
            Review Applicants
          </Button>
        )}
      </div>
    );
  }

  // Desktop table row
  return (
    <tr className="hover:bg-gray-50/50 border-b border-gray-100">
      {/* Event Name with Logo */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
          </div>
          <span className="font-medium text-gray-900 text-sm">
            {event.eventName}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            event.status === "Live"
              ? "bg-white text-gray-800 border border-gray-200"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {event.status === "Live" && <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>}
          {event.status}
          {event.status === "Live" && <div className="ml-1 text-gray-500 text-xs">▼</div>}
        </span>
      </td>

      {/* Event Type */}
      <td className="px-6 py-2 text-gray-600 text-sm">
        {event.eventType}
      </td>

      {/* Posted On */}
      <td className="px-6 py-2 text-gray-600 text-sm">
        {event.postedOn}
      </td>

      {/* Due Date */}
      <td className="px-6 py-2 text-gray-600 text-sm">
        {event.dueDate}
      </td>

      {/* Total Registration */}
      <td className="px-6 py-2 text-gray-900 font-medium text-sm text-center">
        {event.totalRegistration}
      </td>

      {/* Action */}
      <td className="px-6 py-4">
        {event.status === "Closed" ? (
          <Button
            size="sm"
            disabled
            className="bg-gray-300 text-gray-500 cursor-not-allowed text-xs px-2 py-1 rounded-full"
          >
            Closed
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => router.push(`/events/${event.id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1 rounded-full text-white"
          >
            Review Applicants
          </Button>
        )}
      </td>
    </tr>
  );
}
