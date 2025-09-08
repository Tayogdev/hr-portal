import React from "react";
import Image from "next/image";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventDetails } from "@/types/event/eventDetail";

interface EventDetailHeaderProps {
  eventDetails: EventDetails | null;
  jobStatus: "Live" | "Closed";
  statusDropdownOpen: boolean;
  jobMenuOpen: boolean;
  isPageOwner: boolean;
  onStatusToggle: () => void;
  onStatusChange: (status: "Live" | "Closed") => void;
  onMenuToggle: () => void;
  onEditEvent: () => void;
  statusRef: React.RefObject<HTMLDivElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

export default function EventDetailHeader({
  eventDetails,
  jobStatus,
  statusDropdownOpen,
  jobMenuOpen,
  isPageOwner,
  onStatusToggle,
  onStatusChange,
  onMenuToggle,
  onEditEvent,
  statusRef,
  menuRef,
}: EventDetailHeaderProps) {
  return (
    <div
      className="
        w-full 
        flex flex-col sm:flex-row justify-between 
        items-start sm:items-center 
        gap-3 sm:gap-4 
        mb-6 px-4 sm:px-6 md:px-1
      "
    >
      {/* Left Section */}
      <div className="flex gap-4 flex-1">
        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
          </div>
        </div>
        <div className="flex-1">
          <h1 className="font-semibold" style={{
            fontFamily: 'Poppins',
            fontWeight: 600,
            fontSize: '24px',
            lineHeight: '120%',
            letterSpacing: '0%'
          }}>
            {eventDetails?.title || "User Experience and Research Conference"}
          </h1>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <span>Department of Design, IIT Hyderabad</span>
                <span>•</span>
                <span>{eventDetails?.isOnline ? "Online" : "Offline"}</span>
                <span>•</span>
                <span>Open to All</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                <span>
                  Posted on {eventDetails?.createdAt
                    ? new Date(eventDetails.createdAt).toLocaleDateString('en-GB')
                    : "08.07.2024"}
                </span>
                <span>•</span>
                <span>
                  Event on {eventDetails?.regEndDate
                    ? new Date(eventDetails.regEndDate).toLocaleDateString('en-GB')
                    : "19.08.2025"}
                </span>
              </div>
            </div>
            
            {/* Right Section - Aligned with date line */}
            <div className="flex items-center gap-2" ref={statusRef}>
              {/* Live Status Button - smaller size */}
              <div className="relative">
                <button
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                    jobStatus === "Live"
                      ? "bg-white text-gray-700 border-green-400 hover:bg-green-50"
                      : "bg-gray-100 text-gray-600 border-gray-300"
                  }`}
                  onClick={onStatusToggle}
                >
                  {jobStatus === "Live" && (
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  )}
                  {jobStatus}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {statusDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-28">
                    {["Live", "Closed"].map((status) => (
                      <button
                        key={status}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-xs"
                        onClick={() => {
                          onStatusChange(status as "Live" | "Closed");
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Event Details Button - smaller */}
              <button className="px-3 py-1.5 rounded-lg bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 border border-gray-300">
                Event Details
              </button>

              {/* Share Button - smaller */}
              <button
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 border border-gray-300"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Event link copied to clipboard!");
                }}
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>

              {/* More Options Menu - smaller */}
              <div className="relative" ref={menuRef}>
                <button
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 border border-gray-300"
                  onClick={onMenuToggle}
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 13a1 1 0 100-2 1 1 0 000 2zM19 13a1 1 0 100-2 1 1 0 000 2zM5 13a1 1 0 100-2 1 1 0 000 2z" />
                  </svg>
                </button>
                {jobMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-36">
                    <button
                      className="block w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-xs"
                      onClick={onEditEvent}
                    >
                      Edit Event
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
