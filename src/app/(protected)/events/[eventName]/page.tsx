'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Share2, Filter } from 'lucide-react'; // Added Pencil for the edit icons
import { Button } from '../../../../components/ui/button';
import EditEventModal from '../../../../components/EditEventModal';


// Assuming these are available as separate components in your project
// You'll need to define these components (AssignTaskModal, ScheduleInterviewModal)
// and their respective types (ApplicantProfile, etc.) if they don't exist.
// For the purpose of this code, we'll include placeholder functions for their logic.
interface ApplicantProfile {
  id: string;
  name: string;
  image: string;
  type: string;
  title: string;
  tags: string[];
  appliedDate: string;
  score: number;
  status: 'SHORTLISTED' | 'FINAL' | 'REJECTED' | 'PENDING' | 'HOLD';
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
  userId?: string; // Added userId for API calls
  // Questionnaire data fields
  firstName?: string;
  lastName?: string;
  gender?: string;
  maritalStatus?: boolean;
  profession?: string;
  organizationName?: string;
  zipCode?: string;
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

interface PaymentInitiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentRequest: () => void;
  applicantName?: string;
}

const PaymentInitiationModal: React.FC<PaymentInitiationModalProps> = ({ 
  isOpen, 
  onClose, 
  onPaymentRequest 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Frame 1984078167</h2>
          <div className="mb-6">
            <p className="text-lg font-bold text-green-600 mb-2">
              The application is approved
            </p>
            <p className="text-gray-600">
              Proceed for the payment initiation request
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onPaymentRequest}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Payment request
            </button>
          </div>
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
  const [selectedTab, setSelectedTab] = useState<'all' | 'final' | 'approved' | 'hold'>('all');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantProfile | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [approvedSubTab, setApprovedSubTab] = useState<'all' | 'paid' | 'pending'>('all');
  const [eventDetails, setEventDetails] = useState<{
    id: string;
    title: string;
    type: string;
    isOnline: boolean;
    createdAt: string;
    regEndDate: string;
    description: string;
    startDate: string;
    endDate: string;
    regStartDate: string;
    seat: number;
    price: number;
    website?: string;
    email?: string;
    contact?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPageOwner, setIsPageOwner] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // States for Modals
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [isScheduleInterviewModalOpen, setIsScheduleInterviewModalOpen] = useState(false);
  const [isPaymentInitiationModalOpen, setIsPaymentInitiationModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<{ id: string; title: string; description: string; dueDate: string } | null>(null);
  const [editingInterview, setEditingInterview] = useState<{ id: string; date: string; time: string; interviewer: string; mode: string; link?: string; notes?: string } | null>(null);
  const [activeSection, setActiveSection] = useState<'none' | 'profile' | 'resume' | 'contact' | 'files' | 'taskDetails' | 'interviewDetails' | 'applicantDetails'>('none');

  const [allRegistrations, setAllRegistrations] = useState<number>(0);
  const [finalAttendees, setFinalAttendees] = useState<number>(0);
  const [approvedApplicants, setApprovedApplicants] = useState<number>(0);

  const [applicants, setApplicants] = useState<ApplicantProfile[]>([]);
  const [questionnaireData, setQuestionnaireData] = useState<{
    firstName: string | null;
    lastName: string | null;
    gender: string | null;
    maritalStatus: boolean | null;
    profession: string | null;
    organizationName: string | null;
    email: string | null;
    phoneNo: string | null;
    state: string | null;
    country: string | null;
    zipCode: string | null;
    eventId: string;
    userId: string;
    lastUpdated?: string;
  } | null>(null);

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
            description: event.description || '',
            startDate: event.startDate || '',
            endDate: event.endDate || '',
            regStartDate: event.regStartDate || '',
            seat: event.seat || 0,
            price: event.price || 0,
            website: event.website || '',
            email: event.email || '',
            contact: event.contact || '',
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
            description: '',
            startDate: '',
            endDate: '',
            regStartDate: '',
            seat: 0,
            price: 0,
            website: '',
            email: '',
            contact: '',
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
            userId: string;
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
            // Questionnaire data fields
            firstName?: string;
            lastName?: string;
            gender?: string;
            maritalStatus?: boolean;
            zipCode?: string;
          }) => ({
            id: user.id, // Use the original string ID from database
            userId: user.userId, // Add userId for API calls
            name: user.name,
            image: user.image || '/avatar-placeholder.png',
            type: user.type,
            title: user.title || user.profession || 'Event Participant',
            tags: user.tags || [],
            appliedDate: user.appliedDate,
            score: user.score || 5,
            status: user.status || 'PENDING', // Use the status field directly
            bookingStatus: user.bookingStatus, // Add bookingStatus for payment tracking
            assignedTask: undefined, // You can add task assignment logic later
            scheduledInterview: undefined, // You can add interview scheduling logic later
            resumePath: undefined, // You can add resume upload logic later
            email: user.email, // Add email
            phoneNo: user.phoneNo, // Add phoneNo
            state: user.state, // Add state
            country: user.country, // Add country
            organizationName: user.organizationName, // Add organizationName
            // Questionnaire data fields
            firstName: user.firstName,
            lastName: user.lastName,
            gender: user.gender,
            maritalStatus: user.maritalStatus,
            zipCode: user.zipCode,
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

  // Check page ownership for this event
  useEffect(() => {
    const checkPageOwnership = async () => {
      if (!eventId) return;
      
      try {
        const ownershipResponse = await fetch(`/api/events/${eventId}/ownership`);
        const ownershipData = await ownershipResponse.json();
        
        if (ownershipData.success) {
          setIsPageOwner(ownershipData.data.isOwner);
        } else {
          setIsPageOwner(false);
        }
      } catch (err) {
        console.error('Error checking page ownership:', err);
        setIsPageOwner(false);
      }
    };

    checkPageOwnership();
  }, [eventId]);

  // Real-time countdown timer for reminder cooldown
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update cooldown timers
      setApplicants(prev => [...prev]);
      if (selectedApplicant) {
        setSelectedApplicant(prev => prev ? { ...prev } : null);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [selectedApplicant]);

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
    // Set questionnaire data directly from applicant data
    if (applicant.firstName || applicant.lastName || applicant.gender || applicant.maritalStatus !== undefined || applicant.zipCode) {
      setQuestionnaireData({
        firstName: applicant.firstName || null,
        lastName: applicant.lastName || null,
        gender: applicant.gender || null,
        maritalStatus: applicant.maritalStatus ?? null,
        profession: applicant.profession || null,
        organizationName: applicant.organizationName || null,
        email: applicant.email || null,
        phoneNo: applicant.phoneNo || null,
        state: applicant.state || null,
        country: applicant.country || null,
        zipCode: applicant.zipCode || null,
        eventId: eventId,
        userId: applicant.userId || applicant.id.toString(),
        lastUpdated: new Date().toISOString(),
      });
    } else {
      setQuestionnaireData(null);
    }
  };



  const getFilteredApplicants = (filterType: string) => {
    let filtered = applicants;
    
    // Filter by type
    if (filterType !== 'All') {
      filtered = filtered.filter((app) => app.type === filterType);
    }
    
    // Filter by date range
    if (startDate || endDate) {
      filtered = filtered.filter((app) => {
        const appliedDate = new Date(app.appliedDate);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start && end) {
          return appliedDate >= start && appliedDate <= end;
        } else if (start) {
          return appliedDate >= start;
        } else if (end) {
          return appliedDate <= end;
        }
        return true;
      });
    }
    
    return filtered;
  };

  const getTabFilteredApplicants = () => {
    let filtered = applicants;
    
    // Apply tab filtering
    switch (selectedTab) {
      case 'all':
        filtered = applicants;
        break;
      case 'final':
        filtered = applicants.filter(app => app.bookingStatus === 'SUCCESS');
        break;
              case 'approved':
        filtered = applicants.filter(app => app.status === 'SHORTLISTED');
        // Apply approved sub-tab filtering
        switch (approvedSubTab) {
          case 'paid':
            filtered = filtered.filter(app => app.bookingStatus === 'SUCCESS');
            break;
          case 'pending':
            filtered = filtered.filter(app => app.bookingStatus !== 'SUCCESS');
            break;
          case 'all':
      default:
            // No additional filtering needed for 'all'
            break;
        }
        break;
      case 'hold':
        filtered = applicants.filter(app => app.status === 'HOLD');
        break;
      default:
        filtered = applicants;
    }
    
    // Apply date filtering to all tabs
    if (startDate || endDate) {
      filtered = filtered.filter((app) => {
        const appliedDate = new Date(app.appliedDate);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start && end) {
          return appliedDate >= start && appliedDate <= end;
        } else if (start) {
          return appliedDate >= start;
        } else if (end) {
          return appliedDate <= end;
        }
        return true;
      });
    }
    
    return filtered;
  };

  const filterCounts = {
    All: getFilteredApplicants('All').length,
    Student: getFilteredApplicants('Student').length,
    Professional: getFilteredApplicants('Professional').length,
    'Foreign National': getFilteredApplicants('Foreign National')?.length || 0,
  };

  // Update counts when applicants change
  useEffect(() => {
    setAllRegistrations(applicants.length);
    setFinalAttendees(applicants.filter(app => app.bookingStatus === 'SUCCESS').length);
    setApprovedApplicants(applicants.filter(app => app.status === 'SHORTLISTED').length);
  }, [applicants]);

  // Calculate approved sub-tab counts
  const shortlistedApplicants = applicants.filter(app => app.status === 'SHORTLISTED');
  const holdApplicants = applicants.filter(app => app.status === 'HOLD');
  const approvedPaidCount = shortlistedApplicants.filter(app => app.bookingStatus === 'SUCCESS').length;
  const approvedPendingCount = shortlistedApplicants.filter(app => app.bookingStatus !== 'SUCCESS').length;

  const tabs = [
    { id: 'all', label: `All Registrations (${allRegistrations})` },
    { id: 'approved', label: `Approved (${approvedApplicants})` },
    { id: 'hold', label: `Hold (${holdApplicants.length})` },
    { id: 'final', label: `Final Attendees (${finalAttendees})` },
  ];

  const filters = ['All', 'Student', 'Professional', 'Foreign National'];
  const tabFilteredApplicants = getTabFilteredApplicants();
  
  // Apply type filtering only for "All" tab, otherwise use tab-filtered applicants
  const filteredApplicants = selectedTab === 'all' 
    ? getFilteredApplicants(selectedFilter) 
    : tabFilteredApplicants;

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

  const handleApproveApplicant = async (applicantId: string) => {
    if (!selectedApplicant) return;
    
    try {
      const response = await fetch(`/api/events/${eventId}/applicants/${applicantId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'APPROVED' }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setApplicants(prev => 
          prev.map(applicant => 
            applicant.id.toString() === applicantId 
              ? { ...applicant, status: 'SHORTLISTED' as const }
              : applicant
          )
        );
        
        // Update selected applicant if it's the current one
        if (selectedApplicant.id.toString() === applicantId) {
          setSelectedApplicant(prev => prev ? { ...prev, status: 'SHORTLISTED' as const } : null);
        }
        
        // Show payment initiation modal
        setIsPaymentInitiationModalOpen(true);
      } else {
        alert('Failed to approve applicant: ' + result.message);
      }
    } catch (error) {
      console.error('Error approving applicant:', error);
      alert('Failed to approve applicant. Please try again.');
    }
  };

  const handlePaymentRequest = async () => {
    if (!selectedApplicant) return;
    

    
    try {
      // Update booking status to PENDING for payment
      const response = await fetch(`/api/events/${eventId}/applicants/${selectedApplicant.id}/payment-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingStatus: 'PENDING' }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setApplicants(prev => 
          prev.map(applicant => 
            applicant.id === selectedApplicant.id 
              ? { ...applicant, bookingStatus: 'PENDING' }
              : applicant
          )
        );
        
        // Update selected applicant
        setSelectedApplicant(prev => prev ? { ...prev, bookingStatus: 'PENDING' } : null);
        
        setIsPaymentInitiationModalOpen(false);
        alert('Payment request initiated successfully!');
      } else {
        alert('Failed to initiate payment request: ' + result.message);
      }
    } catch (error) {
      console.error('Error initiating payment request:', error);
      alert('Failed to initiate payment request. Please try again.');
    }
  };

  const handleClosePaymentModal = () => {
    setIsPaymentInitiationModalOpen(false);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedApplicant) return;
    
    try {
      const response = await fetch(`/api/events/${eventId}/applicants/${selectedApplicant.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setApplicants(prev => 
          prev.map(applicant => 
            applicant.id.toString() === selectedApplicant.id.toString()
              ? { ...applicant, status: newStatus as ApplicantProfile['status'] }
              : applicant
          )
        );
        
        // Update selected applicant
        setSelectedApplicant(prev => prev ? { ...prev, status: newStatus as ApplicantProfile['status'] } : null);
        
        alert(`Applicant status updated to ${newStatus} successfully!`);
      } else {
        alert('Failed to update status: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  // Helper function to check if remind button should be disabled
  const isRemindButtonDisabled = (applicant: ApplicantProfile): boolean => {
    // Check localStorage for reminder timestamp
    const storageKey = `reminder_${eventId}_${applicant.id}`;
    const lastReminderTime = localStorage.getItem(storageKey);
    
    if (!lastReminderTime) return false;
    
    const lastReminder = new Date(lastReminderTime);
    const currentTime = new Date();
    const timeDifference = currentTime.getTime() - lastReminder.getTime();
    const twoHoursInMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    
    return timeDifference < twoHoursInMs;
  };

  // Helper function to get remaining cooldown time
  const getRemainingCooldownTime = (applicant: ApplicantProfile): string => {
    const storageKey = `reminder_${eventId}_${applicant.id}`;
    const lastReminderTime = localStorage.getItem(storageKey);
    
    if (!lastReminderTime) return '';
    
    const lastReminder = new Date(lastReminderTime);
    const currentTime = new Date();
    const timeDifference = currentTime.getTime() - lastReminder.getTime();
    const twoHoursInMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    
    if (timeDifference >= twoHoursInMs) return '';
    
    const remainingTime = twoHoursInMs - timeDifference;
    const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
    const remainingMinutes = Math.ceil((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
    
    if (remainingHours > 0) {
      return `${remainingHours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  // Helper function to set reminder timestamp in localStorage
  const setReminderTimestamp = (applicant: ApplicantProfile) => {
    const storageKey = `reminder_${eventId}_${applicant.id}`;
    localStorage.setItem(storageKey, new Date().toISOString());
  };

  const handleSendReminder = async () => {
    if (!selectedApplicant) return;
    
    // Check if button is disabled due to cooldown
    if (isRemindButtonDisabled(selectedApplicant)) {
      const remainingTime = getRemainingCooldownTime(selectedApplicant);
      alert(`Reminder cooldown active. Please wait ${remainingTime} before sending another reminder.`);
      return;
    }
    
    try {
      const response = await fetch(`/api/events/${eventId}/applicants/${selectedApplicant.id}/remind`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        // Set reminder timestamp in localStorage for frontend cooldown
        setReminderTimestamp(selectedApplicant);
        
        // Force re-render to update button state
        setApplicants(prev => [...prev]);
        if (selectedApplicant) {
          setSelectedApplicant(prev => prev ? { ...prev } : null);
        }
        
        alert('Payment reminder sent successfully! Button is now disabled for 2 hours.');
      } else {
        alert('Failed to send reminder: ' + result.message);
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder. Please try again.');
    }
  };

  const downloadApplicantsAsExcel = () => {
    // Check if there are applicants to download
    if (!filteredApplicants || filteredApplicants.length === 0) {
      alert('No applicants to download.');
      return;
    }

    const dataToDownload = filteredApplicants.map(applicant => ({
      'Name': applicant.name || '',
      'Email': applicant.email || '',
      'Phone': applicant.phoneNo || '',
      'Type': applicant.type || '',
      'Status': applicant.status || '',
      'Payment Status': applicant.bookingStatus || 'N/A',
      'Applied Date': applicant.appliedDate ? new Date(applicant.appliedDate).toLocaleDateString() : '',
      'Profession': applicant.profession || '',
      'Organization': applicant.organizationName || '',
      'State': applicant.state || '',
      'Country': applicant.country || '',
      'Gender': applicant.gender || '',
      'Zip Code': applicant.zipCode || ''
    }));

    // Check if dataToDownload has content
    if (!dataToDownload || dataToDownload.length === 0) {
      alert('No data to download.');
      return;
    }

    // Convert to Excel format (XLSX)
    const headers = Object.keys(dataToDownload[0] || {});
    if (headers.length === 0) {
      alert('No headers found for download.');
      return;
    }

    const excelContent = [
      headers.join('\t'),
      ...dataToDownload.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row] || '';
          // Escape tabs and quotes in Excel
          if (typeof value === 'string' && (value.includes('\t') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join('\t')
      )
    ].join('\n');

    // Create and download file as Excel (.xls)
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `applicants_${eventDetails?.title || 'event'}_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  const downloadApplicantsAsPDF = () => {
    // Check if there are applicants to download
    if (!filteredApplicants || filteredApplicants.length === 0) {
      alert('No applicants to download.');
      return;
    }

    // For PDF download, we'll create a simple text-based report
    const dataToDownload = filteredApplicants.map(applicant => ({
      'Name': applicant.name || '',
      'Email': applicant.email || '',
      'Phone': applicant.phoneNo || '',
      'Type': applicant.type || '',
      'Status': applicant.status || '',
      'Payment Status': applicant.bookingStatus || 'N/A',
      'Applied Date': applicant.appliedDate ? new Date(applicant.appliedDate).toLocaleDateString() : '',
      'Profession': applicant.profession || '',
      'Organization': applicant.organizationName || '',
      'State': applicant.state || '',
      'Country': applicant.country || '',
      'Gender': applicant.gender || '',
      'Zip Code': applicant.zipCode || ''
    }));

    // Create a simple text report
    const reportContent = [
      `Applicants Report - ${eventDetails?.title || 'Event'}`,
      `Generated on: ${new Date().toLocaleDateString()}`,
      `Total Applicants: ${filteredApplicants.length}`,
      '',
      ...dataToDownload.map((applicant, index) => [
        `Applicant ${index + 1}:`,
        `  Name: ${applicant.Name}`,
        `  Email: ${applicant.Email}`,
        `  Phone: ${applicant.Phone}`,
        `  Type: ${applicant.Type}`,
        `  Status: ${applicant.Status}`,
        `  Payment Status: ${applicant['Payment Status']}`,
        `  Applied Date: ${applicant['Applied Date']}`,
        `  Profession: ${applicant.Profession}`,
        `  Organization: ${applicant.Organization}`,
        `  State: ${applicant.State}`,
        `  Country: ${applicant.Country}`,
        `  Gender: ${applicant.Gender}`,
        `  Zip Code: ${applicant['Zip Code']}`,
        ''
      ].join('\n'))
    ].join('\n');

    // Create and download file
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `applicants_${eventDetails?.title || 'event'}_${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  const handleRejectApplicant = async (applicantId: string) => {
    if (!selectedApplicant) return;
    
    try {
      const response = await fetch(`/api/events/${eventId}/applicants/${applicantId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'REJECTED' }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setApplicants(prev => 
          prev.map(applicant => 
            applicant.id.toString() === applicantId 
              ? { ...applicant, status: 'REJECTED' as const }
              : applicant
          )
        );
        
        // Update selected applicant if it's the current one
        if (selectedApplicant.id.toString() === applicantId) {
          setSelectedApplicant(prev => prev ? { ...prev, status: 'REJECTED' as const } : null);
        }
        
        alert('Applicant rejected successfully! Email notification sent.');
      } else {
        alert('Failed to reject applicant: ' + result.message);
      }
    } catch (error) {
      console.error('Error rejecting applicant:', error);
      alert('Failed to reject applicant. Please try again.');
    }
  };

  const handleHoldApplicant = async (applicantId: string) => {
    if (!selectedApplicant) return;
    
    try {
      const response = await fetch(`/api/events/${eventId}/applicants/${applicantId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'HOLD' }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setApplicants(prev => 
          prev.map(applicant => 
            applicant.id.toString() === applicantId 
              ? { ...applicant, status: 'HOLD' as const }
              : applicant
          )
        );
        
        // Update selected applicant if it's the current one
        if (selectedApplicant.id.toString() === applicantId) {
          setSelectedApplicant(prev => prev ? { ...prev, status: 'HOLD' as const } : null);
        }
        
        alert('Applicant put on hold successfully.');
      } else {
        alert('Failed to put applicant on hold: ' + result.message);
      }
    } catch (error) {
      console.error('Error putting applicant on hold:', error);
      alert('Failed to put applicant on hold. Please try again.');
    }
  };

  const handleEditEvent = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveEvent = async (updatedData: {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    regStartDate: string;
    regEndDate: string;
    website?: string;
    email?: string;
    contact?: string;
  }) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update only the fields that were edited
          setEventDetails(prev => prev ? {
            ...prev,
            title: updatedData.title,
            description: updatedData.description,
            startDate: updatedData.startDate,
            endDate: updatedData.endDate,
            regStartDate: updatedData.regStartDate,
            regEndDate: updatedData.regEndDate,
            website: updatedData.website,
            email: updatedData.email,
            contact: updatedData.contact,
          } : null);
          
          alert('Event updated successfully!');
        } else {
          alert(`Failed to update event: ${result.message}`);
        }
      } else {
        const errorData = await response.json();
        alert(`Failed to update event: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event. Please try again.');
    }
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

          {isPageOwner && (
            <div className="relative" ref={menuRef}>
              <button className="p-2 hover:bg-gray-100 rounded-full" onClick={() => setJobMenuOpen(!jobMenuOpen)}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 13a1 1 0 100-2 1 1 0 000 2zM19 13a1 1 0 100-2 1 1 0 000 2zM5 13a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
              </button>
              {jobMenuOpen && (
                <div className="absolute right-0 mt-1 bg-white border rounded shadow z-10 w-40">
                  <button 
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={handleEditEvent}
                  >
                    Edit Event
                  </button>
                </div>
              )}
            </div>
          )}
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
              onClick={() => {
                setSelectedTab(tab.id as 'all' | 'final' | 'approved' | 'hold');
                // Reset approved sub-tab when switching to a different main tab
                if (tab.id !== 'approved') {
                  setApprovedSubTab('all');
                }
              }}
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

      {/* Approved Sub-tabs */}
      {selectedTab === 'approved' && (
        <div className="flex justify-between mb-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setApprovedSubTab('all')}
              className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${
                approvedSubTab === 'all' ? 'bg-[#6366F1] text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              All ({shortlistedApplicants.length})
            </button>
            <button
              onClick={() => setApprovedSubTab('paid')}
              className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${
                approvedSubTab === 'paid' ? 'bg-[#6366F1] text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Paid ({approvedPaidCount})
            </button>
            <button
              onClick={() => setApprovedSubTab('pending')}
              className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${
                approvedSubTab === 'pending' ? 'bg-[#6366F1] text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
                          Pending ({approvedPendingCount})
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center justify-center px-4 py-2 rounded-full bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400 transition-all duration-200"
            onClick={downloadApplicantsAsExcel}
            title="Download as Excel"
          >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-all duration-200 ${
                startDate || endDate 
                  ? 'bg-blue-50 border border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
              }`}
              onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
            >
              <Filter className="w-4 h-4" />
              Filter
              {(startDate || endDate) && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Hold tab */}
      {selectedTab === 'hold' && (
        <div className="flex justify-between mb-4 items-center">
          <div></div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center justify-center px-4 py-2 rounded-full bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400 transition-all duration-200"
              onClick={downloadApplicantsAsExcel}
              title="Download as Excel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-all duration-200 ${
                startDate || endDate 
                  ? 'bg-blue-50 border border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
              }`}
              onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
            >
              <Filter className="w-4 h-4" />
              Filter
              {(startDate || endDate) && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Filters for All tab */}
      {selectedTab === 'all' && (
        <div className="flex justify-between mb-4 items-center">
          <div className="flex gap-2">
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
          </div>
          <div className="flex items-center gap-2">
          <button
            className="flex items-center justify-center px-4 py-2 rounded-full bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400 transition-all duration-200"
            onClick={downloadApplicantsAsExcel}
            title="Download as Excel"
          >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-all duration-200 ${
                startDate || endDate 
                  ? 'bg-blue-50 border border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
              }`}
              onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
            >
              <Filter className="w-4 h-4" />
              Filter
              {(startDate || endDate) && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
          </button>
          </div>
        </div>
      )}

      {/* Filter button for Final tab */}
      {selectedTab === 'final' && (
        <div className="flex justify-between mb-4 items-center">
          <div></div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center justify-center px-4 py-2 rounded-full bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400 transition-all duration-200"
              onClick={downloadApplicantsAsExcel}
              title="Download as Excel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-all duration-200 ${
                startDate || endDate 
                  ? 'bg-blue-50 border border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
              }`}
              onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
            >
              <Filter className="w-4 h-4" />
              Filter
              {(startDate || endDate) && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Date Filter Modal */}
      {isDateFilterOpen && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4 shadow-sm max-w-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">Filter by Date</h3>
            <button
              onClick={() => setIsDateFilterOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
            >
              Clear
            </button>
            <button
              onClick={() => setIsDateFilterOpen(false)}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 30% Applicants */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Applicants</h2>
            <button
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-full bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 transition-colors"
              onClick={downloadApplicantsAsExcel}
              title="Download as Excel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
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
                    <div className="mt-2 text-sm text-gray-500">
                      <span>Applied {applicant.appliedDate || 'N/A'}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          applicant.status === 'SHORTLISTED'
                            ? 'bg-purple-100 text-purple-700'
                            : applicant.status === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {applicant.status === 'SHORTLISTED' ? 'Approved' : applicant.status === 'REJECTED' ? 'Rejected' : applicant.status}
                      </span>
                      {applicant.status === 'SHORTLISTED' && applicant.bookingStatus && (
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            applicant.bookingStatus === 'SUCCESS'
                              ? 'bg-green-100 text-green-700'
                              : applicant.bookingStatus === 'PENDING'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {applicant.bookingStatus === 'SUCCESS' ? 'Paid' : 'Pending'}
                        </span>
                      )}
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
      <div className="bg-white rounded-2xl shadow-xs px-6 py-8 w-full relative">
        {/* 3-dot Menu */}
        <div className="absolute top-4 right-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 13a1 1 0 100-2 1 1 0 000 2zM19 13a1 1 0 100-2 1 1 0 000 2zM5 13a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
          </button>
        </div>

        {/* Applicant Info */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedApplicant.name}</h2>
          <p className="text-sm text-gray-700 mb-2">
            {selectedApplicant.title || selectedApplicant.type} {selectedApplicant.organizationName ? `at ${selectedApplicant.organizationName}` : ''}
          </p>

          {/* Tags */}
          <div className="text-blue-600 text-sm font-medium flex flex-wrap justify-start gap-x-2 gap-y-1 mb-4">
            {selectedApplicant.tags?.map((tag, idx) => (
              <span key={idx} className="cursor-pointer hover:underline">{tag}</span>
            ))}
          </div>
        </div>

        {/* Navigation and Action Buttons - Single Row Layout */}
        <div className="flex items-center justify-between mb-6">
          {/* Navigation Tabs */}
          <div className="flex gap-2">
          <button
            className={`border border-gray-300 px-4 py-2 rounded-full text-sm transition ${
              activeSection === 'profile' ? 'text-gray-900' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('profile')}
          >
            Profile
          </button>

          <button
            className={`border border-gray-300 px-4 py-2 rounded-full text-sm transition ${
              activeSection === 'contact' ? 'text-gray-900' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('contact')}
          >
            Contacts
          </button>

          <button
            className={`border border-gray-300 px-4 py-2 rounded-full text-sm transition ${
              activeSection === 'applicantDetails' ? 'text-gray-900' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('applicantDetails')}
          >
            Applicant Details
          </button>
          </div>

          {/* Action Buttons - Right Side */}
          <div className="flex gap-3">
            {selectedApplicant.status === 'SHORTLISTED' ? (
              // Show different buttons based on payment status
              selectedApplicant.bookingStatus === 'SUCCESS' ? (
                // Show Paid button when payment is successful
                <button
                  disabled
                  className="px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 bg-green-100 text-green-600 border border-green-300 cursor-not-allowed"
                >
                  Paid
                </button>
              ) : (
                // Show Pending and Remind buttons when payment is pending
                <>
                  <button
                    disabled
                    className="px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 bg-gray-100 text-gray-500 border border-gray-300 cursor-not-allowed"
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleSendReminder()}
                    disabled={isRemindButtonDisabled(selectedApplicant)}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      isRemindButtonDisabled(selectedApplicant)
                        ? 'bg-gray-100 text-gray-500 border border-gray-300 cursor-not-allowed'
                        : 'bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200'
                    }`}
                  >
                    {isRemindButtonDisabled(selectedApplicant) 
                      ? `Remind (${getRemainingCooldownTime(selectedApplicant)})`
                      : 'Remind'
                    }
                  </button>
                </>
              )
            ) : (
              // Show Reject and Approve buttons for other statuses
              <>
          <button
              onClick={() => handleRejectApplicant(selectedApplicant.id.toString())}
            disabled={selectedApplicant.status === 'REJECTED'}
                            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedApplicant.status === 'REJECTED'
                  ? 'bg-red-50 text-red-600 border border-red-200 cursor-not-allowed'
                  : 'bg-white text-black border border-purple-300 hover:bg-purple-50 hover:border-purple-400'
              }`}
          >
              {selectedApplicant.status === 'REJECTED' ? 'Rejected' : 'Reject'}
          </button>
          
          <button
            onClick={() => handleHoldApplicant(selectedApplicant.id.toString())}
            disabled={selectedApplicant.status === 'HOLD'}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedApplicant.status === 'HOLD'
                ? 'bg-orange-50 text-orange-600 border border-orange-200 cursor-not-allowed'
                : 'bg-white text-black border border-orange-300 hover:bg-orange-50 hover:border-orange-400'
            }`}
          >
            {selectedApplicant.status === 'HOLD' ? 'On Hold' : 'Hold'}
          </button>
          
          <button
            onClick={() => handleApproveApplicant(selectedApplicant.id.toString())}
                  disabled={selectedApplicant.status === 'REJECTED'}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedApplicant.status === 'REJECTED'
                      ? 'bg-gray-50 text-gray-600 border border-gray-200 cursor-not-allowed'
                  : 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 hover:border-blue-700'
            }`}
          >
                  Approved
          </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Second Detail Box (Dynamic) */}
      {activeSection !== 'none' && (
        <div className="bg-white rounded-2xl shadow-xs px-6 py-6 mt-6 max-w-3xl mx-auto">
         {activeSection === 'profile' && (
          <>
    {/* Profile Information */}
        <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
      <div className="space-y-3">
      <p className="text-sm text-gray-700">Email: {selectedApplicant.email || 'No email provided'}</p>
      <p className="text-sm text-gray-700">Profession: {selectedApplicant.title || 'Not specified'}</p>
        <p className="text-sm text-gray-700">Organization: {selectedApplicant.organizationName || 'Not specified'}</p>
      <p className="text-sm text-gray-700">Type: {selectedApplicant.type}</p>
      </div>
    </div>

    {/* Registration Details */}
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Registration Details</h3>
      <div className="space-y-3">
      <p className="text-sm text-gray-700">Registration Date: {selectedApplicant.appliedDate}</p>
      <p className="text-sm text-gray-700">Status: {selectedApplicant.status}</p>
      </div>
    </div>

    {/* Skills/Tags */}
    <div>
      <h3 className="text-lg font-semibold mb-4">Skills & Tags</h3>
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
             <div>
        <h3 className="text-lg font-semibold mb-4">Contact Details</h3>
        <div className="space-y-3">
        <p className="text-sm text-gray-700">Email: {selectedApplicant.email || 'No email provided'}</p>
        <p className="text-sm text-gray-700">Phone: {selectedApplicant.phoneNo || 'No phone provided'}</p>
        <p className="text-sm text-gray-700">State: {selectedApplicant.state || 'Not specified'}</p>
        <p className="text-sm text-gray-700">Country: {selectedApplicant.country || 'Not specified'}</p>
        </div>
      </div>
          )}

          {activeSection === 'applicantDetails' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Applicant Details</h3>
                <div className="flex items-center gap-2">
                  {questionnaireData && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      Last updated: {new Date(questionnaireData.lastUpdated || Date.now()).toLocaleTimeString()}
                    </span>
                  )}
                  <button
                    onClick={() => selectedApplicant && handleApplicantSelection(selectedApplicant)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Refresh data"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {questionnaireData ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={questionnaireData.firstName || ''}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={questionnaireData.lastName || ''}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter last name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        value={questionnaireData.gender || 'Prefer not to say'}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                      <select
                        value={questionnaireData.maritalStatus === true ? 'Married' : questionnaireData.maritalStatus === false ? 'Single' : 'Prefer not to say'}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Associated Institute/Company Name</label>
                      <input
                        type="text"
                        value={questionnaireData.organizationName || ''}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter institute or company name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Institute/Company ID Number</label>
                      <input
                        type="text"
                        value={questionnaireData.zipCode || ''}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter ID number"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-2">No applicant details available</p>
                  <p className="text-sm text-gray-400">The applicant hasn&apos;t filled out their details yet.</p>
                </div>
              )}
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

      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        eventData={eventDetails ? {
          id: eventDetails.id,
          title: eventDetails.title,
          description: eventDetails.description,
          startDate: eventDetails.startDate,
          endDate: eventDetails.endDate,
          regStartDate: eventDetails.regStartDate,
          regEndDate: eventDetails.regEndDate,
          website: eventDetails.website,
          email: eventDetails.email,
          contact: eventDetails.contact
        } : null}
        onSave={handleSaveEvent}
      />

      <PaymentInitiationModal
        isOpen={isPaymentInitiationModalOpen}
        onClose={handleClosePaymentModal}
        onPaymentRequest={handlePaymentRequest}
        applicantName={selectedApplicant?.name}
      />
    </div>
  );
}