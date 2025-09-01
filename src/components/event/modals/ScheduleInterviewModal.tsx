import React from "react";
import { Button } from "@/components/ui/button";
import { InterviewDetails } from "@/types/event/eventDetail";

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApplicantName?: string;
  onScheduleInterview: (interviewDetails: {
    date: string;
    time: string;
    interviewer: string;
    mode: string;
    link?: string;
    notes?: string;
  }) => void;
  editingInterview: InterviewDetails | null;
}

export function ScheduleInterviewModal({
  isOpen,
  onClose,
  selectedApplicantName,
  onScheduleInterview,
  editingInterview,
}: ScheduleInterviewModalProps): React.JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {editingInterview ? "Edit Interview" : "Schedule New Interview"} for{" "}
          {selectedApplicantName}
        </h2>
        <p>This is a placeholder for ScheduleInterviewModal.</p>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button
            onClick={() =>
              onScheduleInterview({
                date: "2025-07-20",
                time: "10:00 AM",
                interviewer: "John Doe",
                mode: "Video Call",
                link: "http://example.com/meet",
              })
            }
            disabled={!!editingInterview}
          >
            {editingInterview ? "Update Interview" : "Schedule Interview"}
          </Button>
        </div>
      </div>
    </div>
  );
}
