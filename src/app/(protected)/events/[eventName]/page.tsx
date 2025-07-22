'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Share2, Filter } from 'lucide-react'; // Added Pencil for the edit icons
import { Button } from '../../../../components/ui/button';

// Assuming these are available as separate components in your project
// You'll need to define these components (AssignTaskModal, ScheduleInterviewModal)
// and their respective types (ApplicantProfile, etc.) if they don't exist.
// For the purpose of this code, we'll include placeholder functions for their logic.
interface ApplicantProfile {
  id: number;
  name: string;
  image: string;
  type: string;
  title: string;
  tags: string[];
  appliedDate: string;
  score: number;
  status: 'SHORTLISTED' | 'FINAL' | 'REJECTED' | 'PENDING';
  assignedTask?: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
  };
  scheduledInterview?: {
    id: string;
    date: string;
    time: string;
    interviewer: string;
    mode: string;
    link?: string;
    notes?: string;
  };
  resumePath?: string; // Added resumePath to ApplicantProfile
  email?: string; // Added email to ApplicantProfile
  phoneNo?: string; // Added phoneNo to ApplicantProfile
  state?: string; // Added state to ApplicantProfile
  country?: string; // Added country to ApplicantProfile
  bookingStatus?: string; // Added bookingStatus to ApplicantProfile
}

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApplicantName?: string;
  onAssignTask: (taskDetails: { title: string; description: string; dueDate: string }) => void;
  editingTask: { id: string; title: string; description: string; dueDate: string } | null;
}

const AssignTaskModal: React.FC<AssignTaskModalProps> = ({ isOpen, onClose, selectedApplicantName, onAssignTask, editingTask }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{editingTask ? 'Edit Task' : 'Assign New Task'} for {selectedApplicantName}</h2>
        <p>This is a placeholder for AssignTaskModal.</p>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose} className="mr-2">Cancel</Button>
          <Button onClick={() => onAssignTask({ title: 'Dummy Task', description: 'This is a dummy task.', dueDate: '2025-12-31' })} disabled={!!editingTask}>
            {editingTask ? 'Update Task' : 'Assign Task'}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApplicantName?: string;
  onScheduleInterview: (interviewDetails: { date: string; time: string; interviewer: string; mode: string; link?: string; notes?: string }) => void;
  editingInterview: { id: string; date: string; time: string; interviewer: string; mode: string; link?: string; notes?: string } | null;
}

const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({ isOpen, onClose, selectedApplicantName, onScheduleInterview, editingInterview }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{editingInterview ? 'Edit Interview' : 'Schedule New Interview'} for {selectedApplicantName}</h2>
        <p>This is a placeholder for ScheduleInterviewModal.</p>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose} className="mr-2">Cancel</Button>
          <Button onClick={() => onScheduleInterview({ date: '2025-07-20', time: '10:00 AM', interviewer: 'John Doe', mode: 'Video Call', link: 'http://example.com/meet' })} disabled={!!editingInterview}>
            {editingInterview ? 'Update Interview' : 'Schedule Interview'}
          </Button>
        </div>
      </div>
    </div>
  );
};


export default function EventPage() {
  const params = useParams();
  const eventId = params.eventName as string; // Using eventName parameter as eventId

  const [jobStatus, setJobStatus] = useState<'Live' | 'Closed'>('Live');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [jobMenuOpen, setJobMenuOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'final'>('all');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantProfile | null>(null);
  const [eventDetails, setEventDetails] = useState<{
    id: string;
    title: string;
    type: string;
    isOnline: boolean;
    createdAt: string;
    regEndDate: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for Modals
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [isScheduleInterviewModalOpen, setIsScheduleInterviewModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<{ id: string; title: string; description: string; dueDate: string } | null>(null);
  const [editingInterview, setEditingInterview] = useState<{ id: string; date: string; time: string; interviewer: string; mode: string; link?: string; notes?: string } | null>(null);
  const [activeSection, setActiveSection] = useState<'none' | 'profile' | 'resume' | 'contact' | 'files' | 'taskDetails' | 'interviewDetails'>('none');

  const [allRegistrations, setAllRegistrations] = useState<number>(0);
  const [finalAttendees, setFinalAttendees] = useState<number>(0);
  const [applicants, setApplicants] = useState<ApplicantProfile[]>([]);

  const statusRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch event data and registered users
  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch event details
        const eventResponse = await fetch(`/api/events/${eventId}`);
        const eventData = await eventResponse.json();
        
        if (eventData.success) {
          const event = eventData.data;
          setEventDetails({
            id: event.id,
            title: event.title,
            type: event.type,
            isOnline: event.isOnline,
            createdAt: event.createdAt,
            regEndDate: event.regEndDate,
          });
        } else {
          // Fallback to static data if event not found
          setEventDetails({
            id: eventId,
            title: 'Sample Event',
            type: 'Conference',
            isOnline: true,
            createdAt: new Date().toISOString(),
            regEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
        
        // Fetch registered users for this event
        const applicantsResponse = await fetch(`/api/events/${eventId}/applicants?page=1&limit=50`);
        const applicantsData = await applicantsResponse.json();
        
        if (applicantsData.success) {
          const registeredUsers = applicantsData.data.registeredUsers;
          setAllRegistrations(applicantsData.data.pagination.total);
          
          // Calculate final attendees based on booking status
          const finalAttendeesCount = registeredUsers.filter((user: { bookingStatus: string }) => user.bookingStatus === 'SUCCESS').length;
          setFinalAttendees(finalAttendeesCount);
          
          // Transform registered users to match ApplicantProfile interface
          const transformedApplicants: ApplicantProfile[] = registeredUsers.map((user: {
            id: string;
            name: string;
            email: string;
            image?: string;
            type: string;
            title?: string;
            tags?: string[];
            appliedDate: string;
            score?: number;
            status: string;
            profession?: string;
            organizationName?: string;
            phoneNo?: string;
            state?: string;
            country?: string;
            bookingStatus: string;
          }) => ({
            id: parseInt(user.id) || Math.random(),
            name: user.name,
            image: user.image || '/avatar-placeholder.png',
            type: user.type,
            title: user.title || user.profession || 'Event Participant',
            tags: user.tags || [],
            appliedDate: user.appliedDate,
            score: user.score || 5,
            status: user.bookingStatus === 'SUCCESS' ? 'FINAL' : 'PENDING', // Use booking status to determine status
            assignedTask: undefined, // You can add task assignment logic later
            scheduledInterview: undefined, // You can add interview scheduling logic later
            resumePath: undefined, // You can add resume upload logic later
            email: user.email, // Add email
            phoneNo: user.phoneNo, // Add phoneNo
            state: user.state, // Add state
            country: user.country, // Add country
          }));
          
          setApplicants(transformedApplicants);
        } else {
          // Fallback to static data if API fails
          setAllRegistrations(0);
          setFinalAttendees(0);
          setApplicants([]);
        }
        
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load event data');
        setApplicants([]);
        setAllRegistrations(0);
        setFinalAttendees(0);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setJobMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApplicantSelection = (applicant: ApplicantProfile) => {
    setSelectedApplicant(applicant);
    setActiveSection("none"); // Reset active section when a new applicant is selected
  };

  const getFilteredApplicants = (filterType: string) => {
    if (filterType === 'All') return applicants;
    return applicants.filter((app) => app.type === filterType);
  };

  const filterCounts = {
    All: applicants.length,
    Student: getFilteredApplicants('Student').length,
    Professional: getFilteredApplicants('Professional').length,
    'Foreign National': getFilteredApplicants('Foreign National')?.length || 0,
  };

  const tabs = [
    { id: 'all', label: `All Registrations (${allRegistrations})` },
    { id: 'final', label: `Final Attendees (${finalAttendees})` },
  ];

  const filters = ['All', 'Student', 'Professional', 'Foreign National'];
  const filteredApplicants = getFilteredApplicants(selectedFilter);

  // Dummy functions for modal actions - replace with actual logic
  const handleAssignTask = (taskDetails: { title: string; description: string; dueDate: string }) => {
    if (selectedApplicant) {
      const updatedApplicant = {
        ...selectedApplicant,
        assignedTask: { id: editingTask?.id || `task-${Date.now()}`, ...taskDetails },
      };
      // In a real app, you'd update your applicants state or send to backend
      setSelectedApplicant(updatedApplicant);
      alert(`${editingTask ? 'Updated' : 'Assigned'} task "${taskDetails.title}" for ${selectedApplicant.name}`);
      setIsAssignTaskModalOpen(false);
      setEditingTask(null);
      setActiveSection("taskDetails");
    }
  };

  const handleScheduleInterview = (interviewDetails: { date: string; time: string; interviewer: string; mode: string; link?: string; notes?: string }) => {
    if (selectedApplicant) {
      const updatedApplicant = {
        ...selectedApplicant,
        scheduledInterview: { id: editingInterview?.id || `interview-${Date.now()}`, ...interviewDetails },
      };
      // In a real app, you'd update your applicants state or send to backend
      setSelectedApplicant(updatedApplicant);
      alert(`${editingInterview ? 'Updated' : 'Scheduled'} interview for ${selectedApplicant.name} on ${interviewDetails.date}`);
      setIsScheduleInterviewModalOpen(false);
      setEditingInterview(null);
      setActiveSection("interviewDetails");
    }
  };

  const handleCloseTaskModal = () => {
    setIsAssignTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleCloseInterviewModal = () => {
    setIsScheduleInterviewModalOpen(false);
    setEditingInterview(null);
  };


  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading event details...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the latest information</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <>
      {/* Header */}
      <div className="bg-white rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
            <Image src="/job-icon.png" alt="Icon" width={24} height={24} />
          </div>
          <div>
                <h1 className="text-lg md:text-xl font-semibold text-gray-900">
                  {eventDetails?.title || 'Event Details'}
                </h1>
                <p className="text-sm text-gray-500">
                  {eventDetails?.type || 'Event'} • {eventDetails?.isOnline ? 'Online' : 'Offline'}
                </p>
                <p className="text-sm text-gray-500">
                  Posted on {eventDetails?.createdAt ? new Date(eventDetails.createdAt).toLocaleDateString() : 'N/A'} • 
                  Closing on {eventDetails?.regEndDate ? new Date(eventDetails.regEndDate).toLocaleDateString() : 'N/A'}
                </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap" ref={statusRef}>
          <button
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              jobStatus === 'Live' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
            }`}
            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
          >
            {jobStatus} ▼
          </button>
          {statusDropdownOpen && (
            <div className="absolute mt-1 bg-white border rounded shadow z-10 w-32">
              {['Live', 'Closed'].map((status) => (
                <button
                  key={status}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setJobStatus(status as 'Live' | 'Closed');
                    setStatusDropdownOpen(false);
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          )}

       <button
  className="w-auto px-4 py-2 rounded-full bg-white text-gray-800 text-sm font-medium hover:bg-gray-100 flex items-center justify-center border border-gray-300"
>
  Event Details
</button>

          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:bg-gray-100"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
                  alert('Event link copied to clipboard!');
            }}
          >
            <Share2 className="w-5 h-5" />
          </Button>

          <div className="relative" ref={menuRef}>
            <button className="p-2 hover:bg-gray-100 rounded-full" onClick={() => setJobMenuOpen(!jobMenuOpen)}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 13a1 1 0 100-2 1 1 0 000 2zM19 13a1 1 0 100-2 1 1 0 000 2zM5 13a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
            </button>
            {jobMenuOpen && (
              <div className="absolute right-0 mt-1 bg-white border rounded shadow z-10 w-40">
                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Edit Event</button>
                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Delete Event</button>
              </div>
            )}
          </div>
        </div>
      </div>
        </>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4 md:mb-6 overflow-x-auto">
        <div className="flex gap-4 md:gap-8 whitespace-nowrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as 'all' | 'final')}
              className={`py-2 md:py-4 px-1 relative ${
                selectedTab === tab.id ? 'text-[#6366F1] font-medium' : 'text-black'
              }`}
            >
              {tab.label}
              {selectedTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366F1]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      {selectedTab === 'all' && (
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${
                selectedFilter === filter ? 'bg-[#6366F1] text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {filter} ({filterCounts[filter as keyof typeof filterCounts]})
            </button>
          ))}
          <button
            className="ml-auto flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 text-sm rounded-full transition-colors hover:bg-gray-100"
            onClick={() => alert(`Reviewing applicants filtered by: ${selectedFilter}`)}
          >
            <Filter className="w-4 h-4 text-gray-600" />
            Review by filters
          </button>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 30% Applicants */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-lg p-4 shadow-xs">
          <h2 className="text-lg font-semibold mb-4">Applicants</h2>
          {filteredApplicants.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applicants yet</h3>
              <p className="text-gray-500 mb-4">
                {selectedFilter === 'All' 
                  ? "This event doesn't have any registrations yet."
                  : `No ${selectedFilter.toLowerCase()} applicants found for this filter.`
                }
              </p>
              {selectedFilter !== 'All' && (
                <button
                  onClick={() => setSelectedFilter('All')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all applicants
                </button>
              )}
            </div>
          ) : (
            filteredApplicants.map((applicant) => {
              const isSelected = selectedApplicant?.id === applicant.id;
              return (
                <div
                  key={applicant.id}
                  onClick={() => handleApplicantSelection(applicant)}
                  className={`flex gap-4 cursor-pointer p-4 border-l-4 rounded-r-lg mb-3 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {applicant.image ? (
                      <Image
                        src={applicant.image}
                        alt={applicant.name}
                        width={48}
                        height={48}
                        className="object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-gray-600">
                        {applicant.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{applicant.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{applicant.title || applicant.type}</p>
                    <div className="text-sm text-blue-600 mt-1 flex flex-wrap gap-x-2">
                      {applicant.tags?.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="bg-blue-100 px-2 py-0.5 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between text-sm text-gray-500">
                      <span>Applied {applicant.appliedDate || 'N/A'}</span>
                      <span
                        className={`font-semibold ${
                          applicant.score >= 8
                            ? 'text-green-600'
                            : applicant.score >= 6
                            ? 'text-yellow-600'
                            : 'text-gray-600'
                        }`}
                      >
                        Score: {applicant.score}
                      </span>
                    </div>
                    <div className="mt-1">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          applicant.status === 'SHORTLISTED'
                            ? 'bg-blue-100 text-blue-800'
                            : applicant.status === 'FINAL'
                            ? 'bg-green-100 text-green-800'
                            : applicant.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {applicant.status || 'PENDING'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: 70% Applicant Details */}
        {/* Right Panel Redesigned */}
<div className="col-span-12 lg:col-span-8">
  {selectedApplicant ? (
    <div className="  py-0.5 ">
      <div className="col-span-12 lg:col-span-8">
  {selectedApplicant ? (
    <>
      {/* Main Box */}
      <div className="bg-white rounded-2xl shadow-xs px-6 py-8 max-w-3xl mx-auto relative">
        {/* 3-dot Menu */}
        <div className="absolute top-4 right-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 13a1 1 0 100-2 1 1 0 000 2zM19 13a1 1 0 100-2 1 1 0 000 2zM5 13a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
          </button>
        </div>

        {/* Applicant Info */}
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedApplicant.name}</h2>
        <p className="text-sm text-gray-700 mb-4">
          {selectedApplicant.title || selectedApplicant.type}, Pursuing Bachelors of Design from IIT Hyderabad
        </p>

        {/* Tags */}
        <div className="text-blue-600 text-sm font-medium flex flex-wrap justify-start gap-x-2 gap-y-1 mb-6">
          {selectedApplicant.tags?.map((tag, idx) => (
            <span key={idx} className="cursor-pointer hover:underline">{tag}</span>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            className={`border border-gray-300 px-5 py-2 rounded-full text-sm transition ${
              activeSection === 'profile' ? 'text-gray-900' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('profile')}
          >
            Profile
          </button>

        

          <button
            className={`border border-gray-300 px-5 py-2 rounded-full text-sm transition ${
              activeSection === 'contact' ? 'text-gray-900' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('contact')}
          >
            Contacts
          </button>

        </div>
      </div>

      {/* Second Detail Box (Dynamic) */}
      {activeSection !== 'none' && (
        <div className=" rounded-2xl  px-6 py-6 mt-6 max-w-3xl mx-auto">
         {activeSection === 'profile' && (
          <>
    {/* Education Box */}
        <div className="bg-white rounded-2xl shadow-xs px-6 py-6 mt-6 max-w-3xl mx-auto">
      <h3 className="text-lg font-semibold mb-2">Profile Information</h3>
      <p className="text-sm text-gray-700">Email: {selectedApplicant.email || 'No email provided'}</p>
      <p className="text-sm text-gray-700">Profession: {selectedApplicant.title || 'Not specified'}</p>
      <p className="text-sm text-gray-700">Organization: {selectedApplicant.tags?.find(tag => tag !== selectedApplicant.title) || 'Not specified'}</p>
      <p className="text-sm text-gray-700">Type: {selectedApplicant.type}</p>
    </div>

    {/* Registration Details Box */}
    <div className="bg-white rounded-2xl shadow-xs px-6 py-6 mt-6 max-w-3xl mx-auto">
      <h3 className="text-lg font-semibold mb-2">Registration Details</h3>
      <p className="text-sm text-gray-700">Registration Date: {selectedApplicant.appliedDate}</p>
      <p className="text-sm text-gray-700">Status: {selectedApplicant.status}</p>
      <p className="text-sm text-gray-700">Score: {selectedApplicant.score}/10</p>
    </div>

    {/* Skills/Tags Box */}
    <div className="bg-white rounded-2xl shadow-xs px-6 py-6 mt-6 max-w-3xl mx-auto">
      <h3 className="text-lg font-semibold mb-2">Skills & Tags</h3>
      <div className="flex flex-wrap gap-2">
        {selectedApplicant.tags && selectedApplicant.tags.length > 0 ? (
          selectedApplicant.tags.map((tag, idx) => (
            <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {tag}
            </span>
          ))
        ) : (
          <p className="text-sm text-gray-500">No skills or tags specified</p>
        )}
      </div>
    </div>
  </>
)}


          {activeSection === 'contact' && (
             <div className="bg-white rounded-2xl shadow-xs px-6 py-6 mt-6 max-w-3xl mx-auto">
        <h3 className="text-lg font-semibold mb-2">Contact Details</h3>
        <p className="text-sm text-gray-700">Email: {selectedApplicant.email || 'No email provided'}</p>
        <p className="text-sm text-gray-700">Phone: {selectedApplicant.phoneNo || 'No phone provided'}</p>
        <p className="text-sm text-gray-700">State: {selectedApplicant.state || 'Not specified'}</p>
        <p className="text-sm text-gray-700">Country: {selectedApplicant.country || 'Not specified'}</p>
      </div>
          )}

        </div>
      )}
    </>
  ) : (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">Select an applicant</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        Choose an applicant from the list to view their detailed profile, contact information, and registration details.
      </p>
    </div>
  )}
</div>

    </div>
  ) : (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">Select an applicant</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        Choose an applicant from the list to view their detailed profile, contact information, and registration details.
      </p>
    </div>
  )}
</div>

      </div>


     
      {/* Modals */}
      <AssignTaskModal
        isOpen={isAssignTaskModalOpen}
        onClose={handleCloseTaskModal}
        selectedApplicantName={selectedApplicant?.name}
        onAssignTask={handleAssignTask}
        editingTask={editingTask}
      />

      <ScheduleInterviewModal
        isOpen={isScheduleInterviewModalOpen}
        onClose={handleCloseInterviewModal}
        selectedApplicantName={selectedApplicant?.name}
        onScheduleInterview={handleScheduleInterview}
        editingInterview={editingInterview}
      />
    </div>
  );
}