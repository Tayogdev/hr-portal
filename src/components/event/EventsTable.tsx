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
    <div className="w-full overflow-x-auto rounded-xl shadow bg-white">
      <div className="min-w-[800px] w-full">
        {/* Table Header */}
        <div className="bg-[#4A5568] text-white px-6 py-4">
          <div className="grid grid-cols-7 gap-4">
            {TABLE_HEADERS.map((header) => (
              <div key={header} className="font-medium">
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
  );
}
