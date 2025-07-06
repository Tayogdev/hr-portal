// components/ScheduleInterviewModal.tsx
"use client";

import React, { useState } from 'react'; // Removed useEffect from the import
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Define the type for the data that will be passed back to the parent
type InterviewDetails = {
  selectedDate: Date | undefined;
  selectedTime: string;
  notesForCandidate: string;
  assignInterviewer: string;
  modeOfInterview: string;
  linkAddress: string;
};

type ScheduleInterviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedApplicantName?: string;
  onScheduleInterview: (details: InterviewDetails) => void; // <--- NEW PROP
};

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({ isOpen, onClose, selectedApplicantName, onScheduleInterview }) => {
  // All useState calls are already at the top level, unconditionally
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('9:00 AM');
  const [notesForCandidate, setNotesForCandidate] = useState<string>('');
  const [assignInterviewer, setAssignInterviewer] = useState<string>('');
  const [modeOfInterview, setModeOfInterview] = useState<string>('Google Meet');
  const [linkAddress, setLinkAddress] = useState<string>('');
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);

  const interviewers = ['John Doe', 'Jane Smith', 'Mike Ross', 'Sarah Lee'];
  const timeSlots = ['9:00 AM', '10:00 AM', '12:00 PM', '3:00 PM', '4:00 PM'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const interviewDetails = {
      selectedDate,
      selectedTime,
      notesForCandidate,
      assignInterviewer,
      modeOfInterview,
      linkAddress,
    };

    // Call the prop function to send data back to the parent
    onScheduleInterview(interviewDetails);

    setShowSuccessMessage(true);

    setTimeout(() => {
      setShowSuccessMessage(false);
      onClose(); // Close the modal
      // Reset form fields after successful submission and closing
      setSelectedDate(undefined);
      setSelectedTime('9:00 AM');
      setNotesForCandidate('');
      setAssignInterviewer('');
      setModeOfInterview('Google Meet');
      setLinkAddress('');
    }, 3000);
  };

  // Conditionally render the modal only if isOpen is true
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm sm:max-w-md md:max-w-xl lg:max-w-3xl xl:max-w-5xl
                     max-h-[90vh] mx-auto relative flex flex-col shadow-lg overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl font-light z-10"
          aria-label="Close"
        >
          &times;
        </button>

        {showSuccessMessage ? (
          <div className="flex flex-col items-center justify-center h-full py-20 animate-fade-in">
            <svg
              className="w-16 h-16 text-green-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Interview Scheduled Successfully!</h2>
            <p className="text-gray-600 text-center">
              The interview for {selectedApplicantName || 'the applicant'} has been successfully scheduled.
              The modal will close shortly.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-6 text-gray-900">
              When do you want your interview to be conducted? Select a date
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-y-auto pr-2">
              <div className="p-4 rounded-lg shadow-md border border-gray-200">
                <div className="mb-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span className="text-gray-500">Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="rounded-lg shadow-sm border border-gray-200">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          className="bg-white rounded-md"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="mb-4">
                  <p className="block text-sm font-medium text-gray-700 mb-2">Schedule at:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((time) => (
                      <div key={time} className="flex items-center">
                        <input
                          type="radio"
                          id={`time-${time}`}
                          name="schedule-time"
                          value={time}
                          checked={selectedTime === time}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out focus:ring-indigo-500"
                        />
                        <label htmlFor={`time-${time}`} className="ml-2 block text-sm text-gray-900">{time}</label>
                      </div>
                    ))}
                    <button type="button" className="text-sm text-blue-600 hover:underline mt-2 col-span-2 text-left" onClick={() => alert('Set custom time functionality here!')}>
                      Set time
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="notes-candidate" className="block text-sm font-medium text-gray-700 mb-2">Notes for Candidate (Optional)</label>
                  <textarea
                    id="notes-candidate"
                    placeholder="Add any notes, instructions, or links for the candidate..."
                    rows={4}
                    value={notesForCandidate}
                    onChange={(e) => setNotesForCandidate(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  ></textarea>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50/50 shadow-inner">
                <div>
                  <p className="text-sm font-medium text-gray-700">Created/Scheduled By</p>
                  <div className="flex items-center mt-1">
                    <Image src="/avatar-placeholder.png" alt="Vidushi Bhardwaj" width={32} height={32} className="rounded-full mr-2 object-cover" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Vidushi Bhardwaj</p>
                      <p className="text-xs text-gray-500">Interaction Designer</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="assign-interviewer" className="block text-sm font-medium text-gray-700">Assign Interviewer *</label>
                  <select
                    id="assign-interviewer"
                    value={assignInterviewer}
                    onChange={(e) => setAssignInterviewer(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="">team members list</option>
                    {interviewers.map(interviewer => (
                      <option key={interviewer} value={interviewer}>{interviewer}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-4">
                  <label htmlFor="mode-of-interview" className="block text-sm font-medium text-gray-700">Mode of Interview *</label>
                  <select
                    id="mode-of-interview"
                    value={modeOfInterview}
                    onChange={(e) => setModeOfInterview(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                    <option value="In-person">In-person</option>
                  </select>
                </div>

                <div className="mt-4">
                  <label htmlFor="link-address" className="block text-sm font-medium text-gray-700">Link / Address</label>
                  <input
                    type="text"
                    id="link-address"
                    placeholder=""
                    value={linkAddress}
                    onChange={(e) => setLinkAddress(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <Button type="submit" className="w-full bg-[#6366F1] text-white py-2 rounded-md hover:bg-indigo-700 mt-6">
                  Schedule
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};