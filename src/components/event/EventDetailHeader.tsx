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
    <div className="bg-white rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between gap-4">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
          <Image src="/job-icon.png" alt="Icon" width={24} height={24} />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-gray-900">
            {eventDetails?.title || "Event Details"}
          </h1>
          <p className="text-sm text-gray-500">
            {eventDetails?.type || "Event"} •{" "}
            {eventDetails?.isOnline ? "Online" : "Offline"}
          </p>
          <p className="text-sm text-gray-500">
            Posted on{" "}
            {eventDetails?.createdAt
              ? new Date(eventDetails.createdAt).toLocaleDateString()
              : "N/A"}{" "}
            • Closing on{" "}
            {eventDetails?.regEndDate
              ? new Date(eventDetails.regEndDate).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap" ref={statusRef}>
        <button
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
            jobStatus === "Live"
              ? "bg-green-100 text-green-800"
              : "bg-gray-200 text-gray-600"
          }`}
          onClick={onStatusToggle}
        >
          {jobStatus} ▼
        </button>
        {statusDropdownOpen && (
          <div className="absolute mt-1 bg-white border rounded shadow z-10 w-32">
            {["Live", "Closed"].map((status) => (
              <button
                key={status}
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                onClick={() => {
                  onStatusChange(status as "Live" | "Closed");
                }}
              >
                {status}
              </button>
            ))}
          </div>
        )}

        <button className="w-auto px-4 py-2 rounded-full bg-white text-gray-800 text-sm font-medium hover:bg-gray-100 flex items-center justify-center border border-gray-300">
          Event Details
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:bg-gray-100"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Event link copied to clipboard!");
          }}
        >
          <Share2 className="w-5 h-5" />
        </Button>

        {isPageOwner && (
          <div className="relative" ref={menuRef}>
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={onMenuToggle}
            >
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 13a1 1 0 100-2 1 1 0 000 2zM19 13a1 1 0 100-2 1 1 0 000 2zM5 13a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
            </button>
            {jobMenuOpen && (
              <div className="absolute right-0 mt-1 bg-white border rounded shadow z-10 w-40">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={onEditEvent}
                >
                  Edit Event
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
