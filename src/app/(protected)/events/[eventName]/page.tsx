"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditEventModal from "@/components/event/EditEventDialog";
import EventDetailHeader from "@/components/event/EventDetailHeader";
import EventTabs from "@/components/event/EventTabs";
import ApplicantCard from "@/components/event/ApplicantCard";
import ApplicantDetailPanel from "@/components/event/ApplicantDetailPanel";
import ApplicantsPanel from "@/components/event/ApplicantsPanel";
import {
  ActiveSectionType,
  ApplicantProfile,
  ApprovedSubTabType,
  EventDetails,
  InterviewDetails,
  QuestionnaireData,
  TabType,
} from "@/types/event/eventDetail";

// Assuming these are available as separate components in your project
// You'll need to define these components (AssignTaskModal, ScheduleInterviewModal)
// and their respective types (ApplicantProfile, etc.) if they don't exist.
// For the purpose of this code, we'll include placeholder functions for their logic.

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApplicantName?: string;
  onAssignTask: (taskDetails: {
    title: string;
    description: string;
    dueDate: string;
  }) => void;
  editingTask: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
  } | null;
}

const AssignTaskModal: React.FC<AssignTaskModalProps> = ({
  isOpen,
  onClose,
  selectedApplicantName,
  onAssignTask,
  editingTask,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {editingTask ? "Edit Task" : "Assign New Task"} for{" "}
          {selectedApplicantName}
        </h2>
        <p>This is a placeholder for AssignTaskModal.</p>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button
            onClick={() =>
              onAssignTask({
                title: "Dummy Task",
                description: "This is a dummy task.",
                dueDate: "2025-12-31",
              })
            }
            disabled={!!editingTask}
          >
            {editingTask ? "Update Task" : "Assign Task"}
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
  onScheduleInterview: (interviewDetails: {
    date: string;
    time: string;
    interviewer: string;
    mode: string;
    link?: string;
    notes?: string;
  }) => void;
  editingInterview: {
    id: string;
    date: string;
    time: string;
    interviewer: string;
    mode: string;
    link?: string;
    notes?: string;
  } | null;
}

const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  isOpen,
  onClose,
  selectedApplicantName,
  onScheduleInterview,
  editingInterview,
}) => {
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
  onPaymentRequest,
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

  const [jobStatus, setJobStatus] = useState<"Live" | "Closed">("Live");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [jobMenuOpen, setJobMenuOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "all" | "final" | "approved" | "hold"
  >("all");
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [selectedApplicant, setSelectedApplicant] =
    useState<ApplicantProfile | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [approvedSubTab, setApprovedSubTab] =
    useState<ApprovedSubTabType>("all");
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPageOwner, setIsPageOwner] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // States for Modals
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [isScheduleInterviewModalOpen, setIsScheduleInterviewModalOpen] =
    useState(false);
  const [isPaymentInitiationModalOpen, setIsPaymentInitiationModalOpen] =
    useState(false);
  const [editingTask, setEditingTask] = useState<{
    id: string;
    title: string;
    description: string;
    dueDate: string;
  } | null>(null);
  const [editingInterview, setEditingInterview] = useState<{
    id: string;
    date: string;
    time: string;
    interviewer: string;
    mode: string;
    link?: string;
    notes?: string;
  } | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSectionType>("none");

  const [allRegistrations, setAllRegistrations] = useState<number>(0);
  const [finalAttendees, setFinalAttendees] = useState<number>(0);
  const [approvedApplicants, setApprovedApplicants] = useState<number>(0);

  const [applicants, setApplicants] = useState<ApplicantProfile[]>([]);
  const [questionnaireData, setQuestionnaireData] =
    useState<QuestionnaireData | null>(null);

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
            description: event.description || "",
            startDate: event.startDate || "",
            endDate: event.endDate || "",
            regStartDate: event.regStartDate || "",
            seat: event.seat || 0,
            price: event.price || 0,
            website: event.website || "",
            email: event.email || "",
            contact: event.contact || "",
          });
        } else {
          // Fallback to static data if event not found
          setEventDetails({
            id: eventId,
            title: "Sample Event",
            type: "Conference",
            isOnline: true,
            createdAt: new Date().toISOString(),
            regEndDate: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            description: "",
            startDate: "",
            endDate: "",
            regStartDate: "",
            seat: 0,
            price: 0,
            website: "",
            email: "",
            contact: "",
          });
        }

        // Fetch registered users for this event
        const applicantsResponse = await fetch(
          `/api/events/${eventId}/applicants?page=1&limit=50`
        );
        const applicantsData = await applicantsResponse.json();

        if (applicantsData.success) {
          const registeredUsers = applicantsData.data.registeredUsers;
          setAllRegistrations(applicantsData.data.pagination.total);

          // Calculate final attendees based on booking status
          const finalAttendeesCount = registeredUsers.filter(
            (user: { bookingStatus: string }) =>
              user.bookingStatus === "SUCCESS"
          ).length;
          setFinalAttendees(finalAttendeesCount);

          // Transform registered users to match ApplicantProfile interface
          const transformedApplicants: ApplicantProfile[] = registeredUsers.map(
            (user: {
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
              state: string;
              country: string;
              bookingStatus: string;
              // Questionnaire data fields
              firstName?: string;
              lastName?: string;
              gender?: string;
              maritalStatus?: boolean;
              zipCode?: string;
            }) => {
              const transformed = {
                id: user.id, // Use the original string ID from database
                userId: user.userId, // Add userId for API calls
                name: user.name,
                image: user.image || "/avatar-placeholder.png",
                type: user.type,
                title: user.title || user.profession || "Event Participant",
                tags: user.tags || [],
                appliedDate: user.appliedDate,
                score: user.score || 5,
                status: user.status || "PENDING", // Use the status field directly
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
              };
              return transformed;
            }
          );
          setApplicants(transformedApplicants);
        } else {
          // Fallback to static data if API fails
          setAllRegistrations(0);
          setFinalAttendees(0);
          setApplicants([]);
        }
      } catch (err) {
        console.error("Error fetching event data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load event data"
        );
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
        const ownershipResponse = await fetch(
          `/api/events/${eventId}/ownership`
        );
        const ownershipData = await ownershipResponse.json();

        if (ownershipData.success) {
          setIsPageOwner(ownershipData.data.isOwner);
        } else {
          setIsPageOwner(false);
        }
      } catch (err) {
        console.error("Error checking page ownership:", err);
        setIsPageOwner(false);
      }
    };

    checkPageOwnership();
  }, [eventId]);

  // Real-time countdown timer for reminder cooldown
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update cooldown timers
      setApplicants((prev) => [...prev]);
      if (selectedApplicant) {
        setSelectedApplicant((prev) => (prev ? { ...prev } : null));
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleApplicantSelection = (applicant: ApplicantProfile) => {
    setSelectedApplicant(applicant);
    setActiveSection("none"); // Reset active section when a new applicant is selected
    // Set questionnaire data directly from applicant data
    if (
      applicant.firstName ||
      applicant.lastName ||
      applicant.gender ||
      applicant.maritalStatus !== undefined ||
      applicant.zipCode
    ) {
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
    if (filterType !== "All") {
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
      case "all":
        filtered = applicants;
        break;
      case "final":
        filtered = applicants.filter((app) => app.bookingStatus === "SUCCESS");
        break;
      case "approved":
        filtered = applicants.filter((app) => app.status === "SHORTLISTED");
        // Apply approved sub-tab filtering
        switch (approvedSubTab) {
          case "paid":
            filtered = filtered.filter(
              (app) => app.bookingStatus === "SUCCESS"
            );
            break;
          case "pending":
            filtered = filtered.filter(
              (app) => app.bookingStatus !== "SUCCESS"
            );
            break;
          case "all":
          default:
            // No additional filtering needed for 'all'
            break;
        }
        break;
      case "hold":
        filtered = applicants.filter((app) => app.status === "HOLD");
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
    All: getFilteredApplicants("All").length,
    Student: getFilteredApplicants("Student").length,
    Professional: getFilteredApplicants("Professional").length,
    "Foreign National": getFilteredApplicants("Foreign National")?.length || 0,
  };

  // Update counts when applicants change
  useEffect(() => {
    setAllRegistrations(applicants.length);
    setFinalAttendees(
      applicants.filter((app) => app.bookingStatus === "SUCCESS").length
    );
    setApprovedApplicants(
      applicants.filter((app) => app.status === "SHORTLISTED").length
    );
  }, [applicants]);

  // Calculate approved sub-tab counts
  const shortlistedApplicants = applicants.filter(
    (app) => app.status === "SHORTLISTED"
  );
  const holdApplicants = applicants.filter((app) => app.status === "HOLD");
  const approvedPaidCount = shortlistedApplicants.filter(
    (app) => app.bookingStatus === "SUCCESS"
  ).length;
  const approvedPendingCount = shortlistedApplicants.filter(
    (app) => app.bookingStatus !== "SUCCESS"
  ).length;

  const tabs = [
    { id: "all", label: `All Registrations (${allRegistrations})` },
    { id: "approved", label: `Approved (${approvedApplicants})` },
    { id: "hold", label: `Hold (${holdApplicants.length})` },
    { id: "final", label: `Final Attendees (${finalAttendees})` },
  ];

  const filters = ["All", "Student", "Professional", "Foreign National"];
  const tabFilteredApplicants = getTabFilteredApplicants();

  // Apply type filtering only for "All" tab, otherwise use tab-filtered applicants
  const filteredApplicants =
    selectedTab === "all"
      ? getFilteredApplicants(selectedFilter)
      : tabFilteredApplicants;

  // Dummy functions for modal actions - replace with actual logic
  const handleAssignTask = (taskDetails: {
    title: string;
    description: string;
    dueDate: string;
  }) => {
    if (selectedApplicant) {
      const updatedApplicant = {
        ...selectedApplicant,
        assignedTask: {
          id: editingTask?.id || `task-${Date.now()}`,
          ...taskDetails,
        },
      };
      // In a real app, you'd update your applicants state or send to backend
      setSelectedApplicant(updatedApplicant);
      alert(
        `${editingTask ? "Updated" : "Assigned"} task "${taskDetails.title}" for ${selectedApplicant.name}`
      );
      setIsAssignTaskModalOpen(false);
      setEditingTask(null);
      setActiveSection("taskDetails");
    }
  };

  const handleScheduleInterview = (interviewDetails: InterviewDetails) => {
    if (selectedApplicant) {
      const updatedApplicant = {
        ...selectedApplicant,
        scheduledInterview: {
          id: editingInterview?.id || `interview-${Date.now()}`,
          ...interviewDetails,
        },
      };
      // In a real app, you'd update your applicants state or send to backend
      setSelectedApplicant(updatedApplicant);
      alert(
        `${editingInterview ? "Updated" : "Scheduled"} interview for ${selectedApplicant.name} on ${interviewDetails.date}`
      );
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
      const response = await fetch(
        `/api/events/${eventId}/applicants/${applicantId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "APPROVED" }),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Update local state
        setApplicants((prev) =>
          prev.map((applicant) =>
            applicant.id.toString() === applicantId
              ? {
                  ...applicant,
                  status: "SHORTLISTED" as const,
                  bookingStatus: "SHORTLISTING",
                }
              : applicant
          )
        );

        // Update selected applicant if it's the current one
        if (selectedApplicant.id.toString() === applicantId) {
          setSelectedApplicant((prev) =>
            prev
              ? {
                  ...prev,
                  status: "SHORTLISTED" as const,
                  bookingStatus: "SHORTLISTING",
                }
              : null
          );
        }

        // Show payment initiation modal
        setIsPaymentInitiationModalOpen(true);
      } else {
        alert("Failed to approve applicant: " + result.message);
      }
    } catch (error) {
      console.error("Error approving applicant:", error);
      alert("Failed to approve applicant. Please try again.");
    }
  };

  const handlePaymentRequest = async () => {
    if (!selectedApplicant) return;

    try {
      // Update booking status to PENDING for payment
      const response = await fetch(
        `/api/events/${eventId}/applicants/${selectedApplicant.id}/payment-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookingStatus: "PENDING" }),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Update local state
        setApplicants((prev) =>
          prev.map((applicant) =>
            applicant.id === selectedApplicant.id
              ? { ...applicant, bookingStatus: "PENDING" }
              : applicant
          )
        );

        // Update selected applicant
        setSelectedApplicant((prev) =>
          prev ? { ...prev, bookingStatus: "PENDING" } : null
        );

        setIsPaymentInitiationModalOpen(false);
        alert("Payment request initiated successfully!");
      } else {
        alert("Failed to initiate payment request: " + result.message);
      }
    } catch (error) {
      console.error("Error initiating payment request:", error);
      alert("Failed to initiate payment request. Please try again.");
    }
  };

  const handleClosePaymentModal = () => {
    setIsPaymentInitiationModalOpen(false);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedApplicant) return;

    try {
      const response = await fetch(
        `/api/events/${eventId}/applicants/${selectedApplicant.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Update local state
        setApplicants((prev) =>
          prev.map((applicant) =>
            applicant.id.toString() === selectedApplicant.id.toString()
              ? {
                  ...applicant,
                  status: newStatus as ApplicantProfile["status"],
                }
              : applicant
          )
        );

        // Update selected applicant
        setSelectedApplicant((prev) =>
          prev
            ? { ...prev, status: newStatus as ApplicantProfile["status"] }
            : null
        );

        alert(`Applicant status updated to ${newStatus} successfully!`);
      } else {
        alert("Failed to update status: " + result.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
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

    if (!lastReminderTime) return "";

    const lastReminder = new Date(lastReminderTime);
    const currentTime = new Date();
    const timeDifference = currentTime.getTime() - lastReminder.getTime();
    const twoHoursInMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

    if (timeDifference >= twoHoursInMs) return "";

    const remainingTime = twoHoursInMs - timeDifference;
    const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
    const remainingMinutes = Math.ceil(
      (remainingTime % (60 * 60 * 1000)) / (60 * 1000)
    );

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
      alert(
        `Reminder cooldown active. Please wait ${remainingTime} before sending another reminder.`
      );
      return;
    }

    try {
      const response = await fetch(
        `/api/events/${eventId}/applicants/${selectedApplicant.id}/remind`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        // Set reminder timestamp in localStorage for frontend cooldown
        setReminderTimestamp(selectedApplicant);

        // Force re-render to update button state
        setApplicants((prev) => [...prev]);
        if (selectedApplicant) {
          setSelectedApplicant((prev) => (prev ? { ...prev } : null));
        }

        alert(
          "Payment reminder sent successfully! Button is now disabled for 2 hours."
        );
      } else {
        alert("Failed to send reminder: " + result.message);
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      alert("Failed to send reminder. Please try again.");
    }
  };

  const downloadApplicantsAsExcel = () => {
    // Check if there are applicants to download
    if (!filteredApplicants || filteredApplicants.length === 0) {
      alert("No applicants to download.");
      return;
    }

    const dataToDownload = filteredApplicants.map((applicant) => ({
      Name: applicant.name || "",
      Email: applicant.email || "",
      Phone: applicant.phoneNo || "",
      Type: applicant.type || "",
      Status: applicant.status || "",
      "Payment Status": applicant.bookingStatus || "N/A",
      "Applied Date": applicant.appliedDate
        ? new Date(applicant.appliedDate).toLocaleDateString()
        : "",
      Profession: applicant.profession || "",
      Organization: applicant.organizationName || "",
      State: applicant.state || "",
      Country: applicant.country || "",
      Gender: applicant.gender || "",
      "Zip Code": applicant.zipCode || "",
    }));

    // Check if dataToDownload has content
    if (!dataToDownload || dataToDownload.length === 0) {
      alert("No data to download.");
      return;
    }

    // Convert to Excel format (XLSX)
    const headers = Object.keys(dataToDownload[0] || {});
    if (headers.length === 0) {
      alert("No headers found for download.");
      return;
    }

    const excelContent = [
      headers.join("\t"),
      ...dataToDownload.map((row) =>
        headers
          .map((header) => {
            const value = row[header as keyof typeof row] || "";
            // Escape tabs and quotes in Excel
            if (
              typeof value === "string" &&
              (value.includes("\t") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join("\t")
      ),
    ].join("\n");

    // Create and download file as Excel (.xls)
    const blob = new Blob([excelContent], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `applicants_${eventDetails?.title || "event"}_${new Date().toISOString().split("T")[0]}.xls`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  const downloadApplicantsAsPDF = () => {
    // Check if there are applicants to download
    if (!filteredApplicants || filteredApplicants.length === 0) {
      alert("No applicants to download.");
      return;
    }

    // For PDF download, we'll create a simple text-based report
    const dataToDownload = filteredApplicants.map((applicant) => ({
      Name: applicant.name || "",
      Email: applicant.email || "",
      Phone: applicant.phoneNo || "",
      Type: applicant.type || "",
      Status: applicant.status || "",
      "Payment Status": applicant.bookingStatus || "N/A",
      "Applied Date": applicant.appliedDate
        ? new Date(applicant.appliedDate).toLocaleDateString()
        : "",
      Profession: applicant.profession || "",
      Organization: applicant.organizationName || "",
      State: applicant.state || "",
      Country: applicant.country || "",
      Gender: applicant.gender || "",
      "Zip Code": applicant.zipCode || "",
    }));

    // Create a simple text report
    const reportContent = [
      `Applicants Report - ${eventDetails?.title || "Event"}`,
      `Generated on: ${new Date().toLocaleDateString()}`,
      `Total Applicants: ${filteredApplicants.length}`,
      "",
      ...dataToDownload.map((applicant, index) =>
        [
          `Applicant ${index + 1}:`,
          `  Name: ${applicant.Name}`,
          `  Email: ${applicant.Email}`,
          `  Phone: ${applicant.Phone}`,
          `  Type: ${applicant.Type}`,
          `  Status: ${applicant.Status}`,
          `  Payment Status: ${applicant["Payment Status"]}`,
          `  Applied Date: ${applicant["Applied Date"]}`,
          `  Profession: ${applicant.Profession}`,
          `  Organization: ${applicant.Organization}`,
          `  State: ${applicant.State}`,
          `  Country: ${applicant.Country}`,
          `  Gender: ${applicant.Gender}`,
          `  Zip Code: ${applicant["Zip Code"]}`,
          "",
        ].join("\n")
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([reportContent], {
      type: "text/plain;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `applicants_${eventDetails?.title || "event"}_${new Date().toISOString().split("T")[0]}.txt`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  const handleRejectApplicant = async (applicantId: string) => {
    if (!selectedApplicant) return;

    try {
      const response = await fetch(
        `/api/events/${eventId}/applicants/${applicantId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "REJECTED" }),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Update local state
        setApplicants((prev) =>
          prev.map((applicant) =>
            applicant.id.toString() === applicantId
              ? {
                  ...applicant,
                  status: "REJECTED" as const,
                  bookingStatus: "REJECTED",
                }
              : applicant
          )
        );

        // Update selected applicant if it's the current one
        if (selectedApplicant.id.toString() === applicantId) {
          setSelectedApplicant((prev) =>
            prev
              ? {
                  ...prev,
                  status: "REJECTED" as const,
                  bookingStatus: "REJECTED",
                }
              : null
          );
        }

        alert("Applicant rejected successfully! Email notification sent.");
      } else {
        alert("Failed to reject applicant: " + result.message);
      }
    } catch (error) {
      console.error("Error rejecting applicant:", error);
      alert("Failed to reject applicant. Please try again.");
    }
  };

  const handleHoldApplicant = async (applicantId: string) => {
    if (!selectedApplicant) return;

    try {
      const response = await fetch(
        `/api/events/${eventId}/applicants/${applicantId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "HOLD" }),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Update local state
        setApplicants((prev) =>
          prev.map((applicant) =>
            applicant.id.toString() === applicantId
              ? { ...applicant, status: "HOLD" as const, bookingStatus: "HOLD" }
              : applicant
          )
        );

        // Update selected applicant if it's the current one
        if (selectedApplicant.id.toString() === applicantId) {
          setSelectedApplicant((prev) =>
            prev
              ? { ...prev, status: "HOLD" as const, bookingStatus: "HOLD" }
              : null
          );
        }

        alert("Applicant put on hold successfully.");
      } else {
        alert("Failed to put applicant on hold: " + result.message);
      }
    } catch (error) {
      console.error("Error putting applicant on hold:", error);
      alert("Failed to put applicant on hold. Please try again.");
    }
  };

  const handleEditEvent = () => {
    setIsEditModalOpen(true);
  };

  const handleStatusToggle = () => {
    setStatusDropdownOpen(!statusDropdownOpen);
  };

  const handleStatusChange = (status: "Live" | "Closed") => {
    setJobStatus(status);
    setStatusDropdownOpen(false);
  };

  const handleMenuToggle = () => {
    setJobMenuOpen(!jobMenuOpen);
  };

  const handleTabChange = (tabId: TabType) => {
    setSelectedTab(tabId);
  };

  const handleApprovedSubTabChange = (subTab: ApprovedSubTabType) => {
    setApprovedSubTab(subTab);
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
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update only the fields that were edited
          setEventDetails((prev) =>
            prev
              ? {
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
                }
              : null
          );

          alert("Event updated successfully!");
        } else {
          alert(`Failed to update event: ${result.message}`);
        }
      } else {
        const errorData = await response.json();
        alert(
          `Failed to update event: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event. Please try again.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading event details...</p>
            <p className="text-gray-500 text-sm mt-2">
              Please wait while we fetch the latest information
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
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
          <EventDetailHeader
            eventDetails={eventDetails}
            jobStatus={jobStatus}
            statusDropdownOpen={statusDropdownOpen}
            jobMenuOpen={jobMenuOpen}
            isPageOwner={isPageOwner}
            onStatusToggle={handleStatusToggle}
            onStatusChange={handleStatusChange}
            onMenuToggle={handleMenuToggle}
            onEditEvent={handleEditEvent}
            statusRef={statusRef}
            menuRef={menuRef}
          />
        </>
      )}

      {/* Tabs */}
      <EventTabs
        tabs={tabs}
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
        onApprovedSubTabChange={handleApprovedSubTabChange}
      />

      {/* Approved Sub-tabs */}
      {selectedTab === "approved" && (
        <div className="flex justify-between mb-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setApprovedSubTab("all")}
              className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${
                approvedSubTab === "all"
                  ? "bg-[#6366F1] text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              All ({shortlistedApplicants.length})
            </button>
            <button
              onClick={() => setApprovedSubTab("paid")}
              className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${
                approvedSubTab === "paid"
                  ? "bg-[#6366F1] text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Paid ({approvedPaidCount})
            </button>
            <button
              onClick={() => setApprovedSubTab("pending")}
              className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${
                approvedSubTab === "pending"
                  ? "bg-[#6366F1] text-white"
                  : "bg-gray-200 text-gray-700"
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
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-all duration-200 ${
                startDate || endDate
                  ? "bg-blue-50 border border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
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
      {selectedTab === "hold" && (
        <div className="flex justify-between mb-4 items-center">
          <div></div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center justify-center px-4 py-2 rounded-full bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400 transition-all duration-200"
              onClick={downloadApplicantsAsExcel}
              title="Download as Excel"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-all duration-200 ${
                startDate || endDate
                  ? "bg-blue-50 border border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
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
      {selectedTab === "all" && (
        <div className="flex justify-between mb-4 items-center">
          <div className="flex gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${
                  selectedFilter === filter
                    ? "bg-[#6366F1] text-white"
                    : "bg-gray-200 text-gray-700"
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
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-all duration-200 ${
                startDate || endDate
                  ? "bg-blue-50 border border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
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
      {selectedTab === "final" && (
        <div className="flex justify-between mb-4 items-center">
          <div></div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center justify-center px-4 py-2 rounded-full bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400 transition-all duration-200"
              onClick={downloadApplicantsAsExcel}
              title="Download as Excel"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-all duration-200 ${
                startDate || endDate
                  ? "bg-blue-50 border border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
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
            <h3 className="text-sm font-medium text-gray-900">
              Filter by Date
            </h3>
            <button
              onClick={() => setIsDateFilterOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                From
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                To
              </label>
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
                setStartDate("");
                setEndDate("");
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
        <ApplicantsPanel
          filteredApplicants={filteredApplicants}
          selectedApplicant={selectedApplicant}
          selectedFilter={selectedFilter}
          onApplicantSelection={handleApplicantSelection}
          onDownloadExcel={downloadApplicantsAsExcel}
          onFilterChange={setSelectedFilter}
        />

        {/* Right: 70% Applicant Details */}
        {/* Right Panel Redesigned */}
        <div className="col-span-12 lg:col-span-8">
          <ApplicantDetailPanel
            selectedApplicant={selectedApplicant}
            activeSection={activeSection}
            questionnaireData={questionnaireData}
            onSectionChange={setActiveSection}
            onApplicantSelection={handleApplicantSelection}
            onSendReminder={handleSendReminder}
            onRejectApplicant={handleRejectApplicant}
            onHoldApplicant={handleHoldApplicant}
            onApproveApplicant={handleApproveApplicant}
            isRemindButtonDisabled={isRemindButtonDisabled}
            getRemainingCooldownTime={getRemainingCooldownTime}
          />
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
        eventData={
          eventDetails
            ? {
                id: eventDetails.id,
                title: eventDetails.title,
                description: eventDetails.description,
                startDate: eventDetails.startDate,
                endDate: eventDetails.endDate,
                regStartDate: eventDetails.regStartDate,
                regEndDate: eventDetails.regEndDate,
                website: eventDetails.website,
                email: eventDetails.email,
                contact: eventDetails.contact,
              }
            : null
        }
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
