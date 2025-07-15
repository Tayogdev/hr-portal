'use client'; 
// This marks the component as client-side in a Next.js app.

import React, { useState, useRef, useEffect } from 'react';
// Importing React and necessary hooks:
// useState - to manage component state
// useRef - to reference DOM elements
// useEffect - to handle side effects like event listeners

import { Calendar, ChevronDown } from 'lucide-react';
// Importing icon components (calendar icon and dropdown arrow)

import { useRouter } from 'next/navigation';
// useRouter allows us to navigate programmatically

// Defining the structure of an Event using TypeScript interface
interface Event {
  eventName: string;         // Name of the event
  status: 'Live' | 'Closed'; // Status of the event
  eventType: string;         // Type: Workshop, Webinar, etc.
  postedOn: string;          // When the event was posted
  dueDate: string;           // Deadline to register
  totalRegistration: number; // Number of people registered
}

export default function Events(): React.JSX.Element {
  // Initial list of events stored in state
  const [eventList, setEventList] = useState<Event[]>([
    {
      eventName: 'User Experience and Research Conference',
      status: 'Live',
      eventType: 'Conference',
      postedOn: '2024-04-10',
      dueDate: '2024-11-25',
      totalRegistration: 750,
    },
    {
      eventName: 'Annual Tech Conference 2024',
      status: 'Live',
      eventType: 'Conference',
      postedOn: '2023-11-15',
      dueDate: '2024-08-10',
      totalRegistration: 1200,
    },
    {
      eventName: 'Web Development Workshop',
      status: 'Closed',
      eventType: 'Workshop',
      postedOn: '2024-01-20',
      dueDate: '2024-03-05',
      totalRegistration: 0,
    },
    {
      eventName: 'Mobile App Hackathon',
      status: 'Live',
      eventType: 'Hackathon',
      postedOn: '2024-02-01',
      dueDate: '2024-07-20',
      totalRegistration: 550,
    },
    {
      eventName: 'Data Science Webinar Series',
      status: 'Closed',
      eventType: 'Webinar',
      postedOn: '2023-12-01',
      dueDate: '2024-01-30',
      totalRegistration: 800,
    },
    {
      eventName: 'Cybersecurity Summit',
      status: 'Live',
      eventType: 'Summit',
      postedOn: '2024-03-10',
      dueDate: '2024-09-15',
      totalRegistration: 950,
    },
  ]);

  // Track which dropdown is open (only one at a time)
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

  // Ref to check clicks outside dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  // For routing to a dynamic event page (Review Applicants)
  const router = useRouter();

  // Close dropdown when user clicks outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownIndex(null); // Close the dropdown
      }
    };

    document.addEventListener('mousedown', handleClickOutside); // Add event listener
    return () => document.removeEventListener('mousedown', handleClickOutside); // Clean up
  }, []);

  // Function to update event status (Live <-> Closed)
  const updateStatus = (index: number, newStatus: 'Live' | 'Closed') => {
    const updated = [...eventList];        // Copy the event list
    updated[index].status = newStatus;     // Change the status
    setEventList(updated);                 // Update state
    setOpenDropdownIndex(null);            // Close dropdown
  };

  // Function to style the status button
  const getStatusClasses = (status: Event['status']) => {
    if (status === 'Live') {
      return 'border-green-300 text-gray-700 hover:bg-green-50';
    } else {
      return 'border-gray-300 text-gray-700 hover:bg-gray-50';
    }
  };

  // Function to get the status dot color
  const getDotClasses = (status: Event['status']) => {
    return status === 'Live' ? 'bg-green-500' : 'bg-transparent';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Events listed from 3rd Nov 2023 to 17th Aug 2024  
          </p>
        </div>

        {/* Date Range Button (just UI here) */}
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors text-sm">
          <Calendar className="w-5 h-5 text-gray-500" />
          <span>3rd Nov 2023 to 17th Aug 2024</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="w-full overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-[#4F5B67] text-white text-xs sm:text-sm">
              <th className="py-3 px-4 text-left">Event Name</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Event Type</th>
              <th className="py-3 px-4 text-left">Posted On</th>
              <th className="py-3 px-4 text-left">Due Date</th>
              <th className="py-3 px-4 text-center">Registrations</th>
              <th className="py-3 px-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {eventList.map((event, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">

                {/* Event Name with Logo */}
                <td className="py-3 px-4 text-gray-700 whitespace-nowrap flex items-center">
                  <img
                    src="/job-icon.png"  // Logo from public folder
                    alt="Event Logo"
                    className="w-10 h-10 object-contain mr-3 flex-shrink-0"
                  />
                  <span className="text-sm sm:text-base">{event.eventName}</span>
                </td>

                {/* Status Button with Dropdown */}
                <td className="py-3 px-4 relative">
                  <div ref={openDropdownIndex === index ? dropdownRef : null}>
                    <button
                      onClick={() =>
                        setOpenDropdownIndex(openDropdownIndex === index ? null : index)
                      }
                      className={`px-3 py-1.5 border rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${getStatusClasses(event.status)}`}
                    >
                      {event.status === 'Live' && (
                        <span className={`w-2 h-2 rounded-full ${getDotClasses(event.status)}`}></span>
                      )}
                      {event.status}
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>

                    {/* Dropdown options */}
                    {openDropdownIndex === index && (
                      <div className="absolute mt-1 left-0 bg-white border border-gray-200 rounded-md shadow-md z-10 w-28">
                        {['Live', 'Closed'].map((statusOption) => (
                          <button
                            key={statusOption}
                            onClick={() => updateStatus(index, statusOption as 'Live' | 'Closed')}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                          >
                            {statusOption}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>

                {/* Other Table Data */}
                <td className="py-3 px-4 text-gray-700">{event.eventType}</td>
                <td className="py-3 px-4 text-gray-700">{event.postedOn}</td>
                <td className="py-3 px-4 text-gray-700">{event.dueDate}</td>
                <td className="py-3 px-4 text-gray-700 text-center">{event.totalRegistration}</td>

                {/* Action Button */}
                <td className="py-3 px-4 text-center">
                  {event.status === 'Closed' ? (
                    <button className="bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs sm:text-sm px-3 py-1.5 rounded-full transition-colors">
                      Closed
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const encodedName = encodeURIComponent(event.eventName); // Safe for URL
                        router.push(`/events/${encodedName}`); // Redirect to event detail page
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-3 py-1.5 rounded-full transition-colors"
                    >
                      Review Applicants
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
