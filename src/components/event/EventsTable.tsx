import React from "react";
import { Event } from "../../types/event/types";
import { EventRow } from "./EventRow";

interface EventsTableProps {
  events: Event[];
}

const TABLE_HEADERS = [
  "Event Name",
  "Status",
  "Event Type",
  "Posted on",
  "Due Date",
  "Registrations",
  "Action",
];

export function EventsTable({ events }: EventsTableProps): React.JSX.Element {
  return (
    <div className="w-full rounded-xl shadow bg-white">
      {/* Desktop Table */}
      <div className="hidden sm:block w-full overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Table Header */}
          <div className="bg-[#4A5568] text-white px-6 py-4">
            <div className="grid grid-cols-7 gap-4">
              {TABLE_HEADERS.map((header) => (
                <div
                  key={header}
                  className="font-medium text-sm md:text-base truncate"
                >
                  {header}
                </div>
              ))}
            </div>
          </div>

          {/* Table Rows */}
          {events.map((event, index) => (
            <EventRow key={event.id} event={event} index={index} />
          ))}
        </div>
      </div>

      {/* Mobile List View */}
      <div className="sm:hidden divide-y">
        {events.map((event, index) => (
          <div key={event.id} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <img
                src="/job-icon.png"
                alt="Event Logo"
                className="w-8 h-8 object-contain"
              />
              <h3 className="font-medium text-base">{event.eventName}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Status:</span> {event.status}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Type:</span> {event.eventType}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Posted:</span> {event.postedOn}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Due:</span> {event.dueDate}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">Registrations:</span>{" "}
              {event.totalRegistration}
            </p>
            {/* Action button */}
            <div>
              <EventRow event={event} index={index} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
