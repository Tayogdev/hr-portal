import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Event } from "../../types/event/types";

interface EventRowProps {
  event: Event;
  index: number;
}

export function EventRow({ event, index }: EventRowProps): React.JSX.Element {
  const router = useRouter();

  return (
    <div
      key={index}
      className="border-b last:border-0 px-4 sm:px-6 py-4 hover:bg-gray-50"
    >
      {/* Mobile: vertical, Desktop: 7 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-4 items-center">
        {/* Event Name with Logo */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0"></div>
          <img
            src="/job-icon.png"
            alt="Event Logo"
            className="w-8 h-8 object-contain"
          />
          <span className="font-medium text-sm sm:text-base">
            {event.eventName}
          </span>
        </div>

        {/* Status */}
        <div>
          <span
            className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${
              event.status === "Live"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {event.status}
          </span>
        </div>

        {/* Event Type */}
        <div className="text-gray-600 text-sm sm:text-base">
          {event.eventType}
        </div>

        {/* Posted On */}
        <div className="text-gray-600 text-sm sm:text-base">
          {event.postedOn}
        </div>

        {/* Due Date */}
        <div className="text-gray-600 text-sm sm:text-base">
          {event.dueDate}
        </div>

        {/* Registrations */}
        <div className="text-gray-600 text-sm sm:text-base">
          {event.totalRegistration}
        </div>

        {/* Action */}
        <div className="flex sm:justify-end">
          {event.status === "Closed" ? (
            <Button
              size="sm"
              disabled
              className="bg-gray-300 text-gray-500 cursor-not-allowed text-xs sm:text-sm px-3 py-1.5 rounded-full"
            >
              Review Applicants
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => router.push(`/events/${event.id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm px-3 py-1.5 rounded-full"
            >
              Review Applicants
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
