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
}

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApplicantName?: string;
  onAssignTask: (taskDetails: { title: string; description: string; dueDate: string }) => void;
  editingTask: any; // You might want to define a specific type for editingTask
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
  editingInterview: any; // You might want to define a specific type for editingInterview
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
  const eventName = decodeURIComponent(params.eventName as string);

  const [jobStatus, setJobStatus] = useState<'Live' | 'Closed'>('Live');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [jobMenuOpen, setJobMenuOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'final'>('all');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantProfile | null>(null);

  // States for Modals
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [isScheduleInterviewModalOpen, setIsScheduleInterviewModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [editingInterview, setEditingInterview] = useState<any | null>(null);
  const [activeSection, setActiveSection] = useState<'none' | 'profile' | 'resume' | 'contact' | 'files' | 'taskDetails' | 'interviewDetails'>('none');


  const [allRegistrations] = useState<number>(22);
  const [finalAttendees] = useState<number>(0);

  const statusRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const applicants: ApplicantProfile[] = [
    {
      id: 1,
      name: 'John Doe',
      image: '/avatar-placeholder.png',
      type: 'Student',
      title: 'Frontend Developer',
      tags: ['React', 'JavaScript', 'CSS'],
      appliedDate: 'July 1',
      score: 8,
      status: 'SHORTLISTED',
      assignedTask: { id: 'task1', title: 'Complete Frontend Assessment', description: 'Build a responsive landing page.', dueDate: '2025-07-15' },
      scheduledInterview: { id: 'interview1', date: 'Monday, July 14, 2025', time: '10:00 AM', interviewer: 'Jane Smith', mode: 'Google Meet', link: 'https://meet.google.com/abc-xyz', notes: 'Discuss project experience and problem-solving skills.' },
      resumePath: '/resume-sample.pdf', // Path to John Doe's resume in public folder
    },
    {
      id: 2,
      name: 'Alice Smith',
      image: '/avatar-placeholder.png',
      type: 'Professional',
      title: 'Software Engineer',
      tags: ['Python', 'Django'],
      appliedDate: 'July 2',
      score: 7,
      status: 'FINAL',
      assignedTask: undefined,
      scheduledInterview: undefined,
      resumePath: '/Alice_Smith_Resume.pdf', // Path to Alice Smith's resume
    },
    {
      id: 3,
      name: 'Raj Kumar',
      image: '/avatar-placeholder.png',
      type: 'Student',
      title: 'Backend Intern',
      tags: ['Node.js', 'MongoDB'],
      appliedDate: 'July 3',
      score: 5,
      status: 'REJECTED',
      assignedTask: undefined,
      scheduledInterview: undefined,
      resumePath: '/Raj_Kumar_Resume.pdf', // Path to Raj Kumar's resume
    },
    {
      id: 4,
      name: 'Emily Zhang',
      image: '/avatar-placeholder.png',
      type: 'Foreign National',
      title: 'UI/UX Designer',
      tags: ['Figma', 'Sketch'],
      appliedDate: 'July 4',
      score: 9,
      status: 'SHORTLISTED',
      assignedTask: undefined,
      scheduledInterview: undefined,
      resumePath: '/Emily_Zhang_Resume.pdf', // Path to Emily Zhang's resume
    },
    {
      id: 5,
      name: 'Carlos Rivera',
      image: '/avatar-placeholder.png',
      type: 'Professional',
      title: 'DevOps Engineer',
      tags: ['AWS', 'Docker', 'Kubernetes'],
      appliedDate: 'July 5',
      score: 6,
      status: 'FINAL',
      assignedTask: undefined,
      scheduledInterview: undefined,
      resumePath: '/Carlos_Rivera_Resume.pdf', // Path to Carlos Rivera's resume
    },
  ];

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

  const handleEditTask = () => {
    if (selectedApplicant?.assignedTask) {
      setEditingTask(selectedApplicant.assignedTask);
      setIsAssignTaskModalOpen(true);
    } else {
      alert('No task assigned to edit.');
    }
  };

  const handleEditInterview = () => {
    if (selectedApplicant?.scheduledInterview) {
      setEditingInterview(selectedApplicant.scheduledInterview);
      setIsScheduleInterviewModalOpen(true);
    } else {
      alert('No interview scheduled to edit.');
    }
  };

  const handleAssignNewTask = () => {
    setEditingTask(null); // Ensure no editing state for new task
    setIsAssignTaskModalOpen(true);
  };

  const handleScheduleNewInterview = () => {
    setEditingInterview(null); // Ensure no editing state for new interview
    setIsScheduleInterviewModalOpen(true);
  };


  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
            <Image src="/job-icon.png" alt="Icon" width={24} height={24} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-gray-900">{eventName}</h1>
            <p className="text-sm text-gray-500">Company • Remote • Needs 2/5</p>
            <p className="text-sm text-gray-500">Posted on 01/05/2024 • Closing on 10/08/2024</p>
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
              alert('Job link copied to clipboard!');
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
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Edit Job</button>
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Delete Job</button>
              </div>
            )}
          </div>
        </div>
      </div>

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
            <div className="text-center py-8 text-gray-500">
              <p>No applicants found for this filter.</p>
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
      <h3 className="text-lg font-semibold mb-2">Education</h3>
      <p className="text-sm text-gray-700">Email: john.doe@example.com</p>
      <p className="text-sm text-gray-700">Education: Bachelors of Design - IIT Hyderabad</p>
      <p className="text-sm text-gray-700">Location: Remote</p>
    </div>

    {/* Experience Box */}
    <div className="bg-white rounded-2xl shadow-xs px-6 py-6 mt-6 max-w-3xl mx-auto">
      <h3 className="text-lg font-semibold mb-2">Experience</h3>
      <p className="text-sm text-gray-700">UI Design Intern at ABC Corp (Jan 2024 - Jun 2024)</p>
      <p className="text-sm text-gray-700">Worked on mobile app prototypes and user research.</p>
    </div>

    {/* Project Box */}
    <div className="bg-white rounded-2xl shadow-xs px-6 py-6 mt-6 max-w-3xl mx-auto">
      <h3 className="text-lg font-semibold mb-2">Project</h3>
      <p className="text-sm text-gray-700">Portfolio Website - Built with React & Tailwind</p>
      <p className="text-sm text-gray-700">Online Design Tool - Collaborative design tool using Figma API</p>
    </div>
  </>
)}


          {activeSection === 'contact' && (
             <div className="bg-white rounded-2xl shadow-xs px-6 py-6 mt-6 max-w-3xl mx-auto">
        <h3 className="text-lg font-semibold mb-2">Contact Details</h3>
        <p className="text-sm text-gray-700">Phone: +91-9876543210</p>
        <p className="text-sm text-gray-700">LinkedIn: linkedin.com/in/johndoe</p>
      </div>
          )}

        </div>
      )}
    </>
  ) : (
    <p className="text-gray-500 text-center">Select an applicant to view details.</p>
  )}
</div>

    </div>
  ) : (
    <p className="text-gray-500 text-center">Select an applicant to view details.</p>
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