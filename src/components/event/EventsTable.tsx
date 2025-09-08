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
  "Total Registration",
  "Action",
];

export function EventsTable({ events }: EventsTableProps): React.JSX.Element {
  return (
    <div className="w-full">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          {/* Table Header */}
          <thead>
            <tr className="bg-slate-600 text-white">
              {TABLE_HEADERS.map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-sm font-medium whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody className="bg-white">
            {events.map((event, index) => (
              <EventRow key={event.id} event={event} index={index} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {events.map((event, index) => (
          <div key={event.id} className="p-4 space-y-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-400 rounded"></div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{event.eventName}</h3>
                <p className="text-sm text-gray-500">{event.eventType}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Status:</span>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      event.status === "Live"
                        ? "bg-white text-gray-800 border border-gray-200"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {event.status === "Live" && <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>}
                    {event.status}
                    {event.status === "Live" && <div className="ml-1.5 text-gray-500">▼</div>}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-gray-500">Registrations:</span>
                <p className="font-medium text-gray-900">{event.totalRegistration}</p>
              </div>
              <div>
                <span className="text-gray-500">Posted:</span>
                <p className="font-medium text-gray-900">{event.postedOn}</p>
              </div>
              <div>
                <span className="text-gray-500">Due:</span>
                <p className="font-medium text-gray-900">{event.dueDate}</p>
              </div>
            </div>
            
            <div className="pt-2">
              <EventRow event={event} index={index} isMobile={true} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
