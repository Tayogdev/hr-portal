"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Share2, SlidersHorizontal, Pencil } from "lucide-react";
import { useParams } from "next/navigation";
import { AssignTaskModal } from "./AssignTaskModal";
import { ScheduleInterviewModal } from "./ScheduleInterviewModal";
import { format } from "date-fns";
import {
  ApplicantProfile,
  OpportunityDetails,
  ApplicantsApiResponse,
} from "@/types/applicants";

type TabId = "all" | "shortlisted" | "final" | "rejected";
type Section =
  | "none"
  | "profile"
  | "resume"
  | "contact"
  | "files"
  | "taskDetails"
  | "interviewDetails";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params?.jobId as string;

  const [markAsOpen, setMarkAsOpen] = useState(false);
  const [applicants, setApplicants] = useState<ApplicantProfile[]>([]);
  const [opportunity, setOpportunity] = useState<OpportunityDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [isScheduleInterviewModalOpen, setIsScheduleInterviewModalOpen] = useState(false);
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
  const [selectedTab, setSelectedTab] = useState<TabId>("all");
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantProfile | null>(null);
  
  // Debug states
  useEffect(() => {
    console.log('Modal states changed:', {
      isAssignTaskModalOpen,
      isScheduleInterviewModalOpen,
      editingTask: !!editingTask,
      editingInterview: !!editingInterview,
      selectedApplicant: selectedApplicant?.name
    });
  }, [isAssignTaskModalOpen, isScheduleInterviewModalOpen, editingTask, editingInterview, selectedApplicant]);
  const [jobStatus, setJobStatus] = useState<"Live" | "Closed">("Live");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [jobMenuOpen, setJobMenuOpen] = useState(false); // ⬅ separate state for the 3-dot job menu

  const [activeSection, setActiveSection] = useState<Section>("none");


  const handleUpdateStatus = async (status: "REJECTED" | "MAYBE" | "SHORTLISTED") => {
    if (selectedApplicant) {
      try {
        const response = await fetch(`/api/opportunities/applicants/${selectedApplicant.id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ status }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();

        if (result.success) {
          const updatedApplicant = {
            ...selectedApplicant,
            status: status,
          };

          // Update the main applicants array
          const updatedApplicants = applicants.map(app =>
            app.id === selectedApplicant.id ? updatedApplicant : app
          );
          setApplicants(updatedApplicants);
          setSelectedApplicant(updatedApplicant);
          setMarkAsOpen(false);

          // Show success message
          alert(`Applicant status updated to ${status} successfully!`);
        } else {
          throw new Error(result.message || 'Failed to update status');
        }
      } catch (error) {
        console.error('Error updating status:', error);
        alert(`Failed to update status. Error: ${error instanceof Error ? error.message : error}`);
      }
    } else {
      console.error('No selected applicant when trying to update status');
      alert('Please select an applicant first');
    }
  };

  const handleShortlist = async () => {
    if (!selectedApplicant) {
      alert('Please select an applicant first');
      return;
    }

    try {
      await handleUpdateStatus("SHORTLISTED");
      // Switch to shortlisted tab after successful shortlisting
      setSelectedTab("shortlisted");
    } catch (error) {
      console.error('Error in handleShortlist:', error);
      // Don't show another alert since handleUpdateStatus already shows one
    }
  };

  const handleEditTask = () => {
    console.log('handleEditTask called');
    console.log('selectedApplicant:', selectedApplicant);
    console.log('assignedTask:', selectedApplicant?.assignedTask);
    
    if (selectedApplicant?.assignedTask) {
      console.log('Setting editing task and opening modal');
      setEditingTask(selectedApplicant.assignedTask);
      setIsAssignTaskModalOpen(true);
      setMenuOpen(false); // Close dropdown
    } else {
      console.log('No assigned task found');
      alert('No task found to edit');
    }
  };

  const handleEditInterview = () => {
    console.log('handleEditInterview called');
    console.log('selectedApplicant:', selectedApplicant);
    console.log('scheduledInterview:', selectedApplicant?.scheduledInterview);
    
    if (selectedApplicant?.scheduledInterview) {
      console.log('Setting editing interview and opening modal');
      setEditingInterview(selectedApplicant.scheduledInterview);
      setIsScheduleInterviewModalOpen(true);
      setMenuOpen(false); // Close dropdown
    } else {
      console.log('No scheduled interview found');
      alert('No interview found to edit');
    }
  };

  const handleAssignNewTask = () => {
    console.log('handleAssignNewTask called - creating new task');
    setEditingTask(null);
    setIsAssignTaskModalOpen(true);
  };

  const handleScheduleNewInterview = () => {
    console.log('handleScheduleNewInterview called - creating new interview');
    setEditingInterview(null);
    setIsScheduleInterviewModalOpen(true);
  };

  const handleViewTaskDetails = () => {
    setActiveSection("taskDetails");
  };

  const handleViewInterviewDetails = () => {
    setActiveSection("interviewDetails");
  };

  const handleCloseTaskModal = () => {
    setIsAssignTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleCloseInterviewModal = () => {
    setIsScheduleInterviewModalOpen(false);
    setEditingInterview(null);
  };
  const statusRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Function to fetch tasks and interviews for a specific applicant
  const fetchApplicantTasksAndInterviews = async (applicant: ApplicantProfile) => {
    console.log('🔍 Fetching tasks and interviews for applicant:', applicant.name, 'ID:', applicant.id);
    const updatedApplicant = { ...applicant };

    // Fetch tasks for this applicant
    try {
      console.log('📋 Fetching tasks...');
      const tasksResponse = await fetch(`/api/tasks?opportunityId=${jobId}&applicantId=${applicant.id}`, {
        credentials: 'include'
      });
      console.log('📋 Tasks response status:', tasksResponse.status);
      
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        console.log('📋 Tasks data:', tasksData);
        
        if (tasksData.success && tasksData.data.tasks.length > 0) {
          const latestTask = tasksData.data.tasks[0]; // Get the most recent task
          updatedApplicant.assignedTask = {
            id: latestTask.id,
            title: latestTask.title,
            description: latestTask.description,
            dueDate: latestTask.dueDate,
          };
          console.log('✅ Task assigned:', updatedApplicant.assignedTask);
        } else {
          console.log('❌ No tasks found for applicant');
        }
      } else {
        console.log('❌ Tasks API call failed:', tasksResponse.status);
      }
    } catch (error) {
      console.warn('❌ Failed to fetch tasks for applicant', applicant.id, error);
    }

    // Fetch interviews for this applicant
    try {
      console.log('🗓️ Fetching interviews...');
      const interviewsResponse = await fetch(`/api/interviews?opportunityId=${jobId}&applicantId=${applicant.id}`, {
        credentials: 'include'
      });
      console.log('🗓️ Interviews response status:', interviewsResponse.status);
      
      if (interviewsResponse.ok) {
        const interviewsData = await interviewsResponse.json();
        console.log('🗓️ Interviews data:', interviewsData);
        
        if (interviewsData.success && interviewsData.data.interviews.length > 0) {
          const latestInterview = interviewsData.data.interviews[0]; // Get the most recent interview
          updatedApplicant.scheduledInterview = {
            id: latestInterview.id,
            date: new Date(latestInterview.scheduledDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            time: latestInterview.scheduledTime,
            interviewer: latestInterview.interviewerName || 'TBD',
            mode: latestInterview.modeOfInterview,
            link: latestInterview.linkAddress,
            notes: latestInterview.notesForCandidate,
          };
          console.log('✅ Interview assigned:', updatedApplicant.scheduledInterview);
        } else {
          console.log('❌ No interviews found for applicant');
        }
      } else {
        console.log('❌ Interviews API call failed:', interviewsResponse.status);
      }
    } catch (error) {
      console.warn('❌ Failed to fetch interviews for applicant', applicant.id, error);
    }

    console.log('🔄 Final updated applicant:', updatedApplicant);
    return updatedApplicant;
  };

  // Enhanced applicant selection handler
  const handleApplicantSelection = async (applicant: ApplicantProfile) => {
    console.log('👤 Applicant selected:', applicant.name, 'Current task:', applicant.assignedTask, 'Current interview:', applicant.scheduledInterview);
    
    // Always fetch the latest tasks and interviews to ensure data is current
    const updatedApplicant = await fetchApplicantTasksAndInterviews(applicant);
    
    // Update the applicant in the state
    setApplicants(prevApplicants =>
      prevApplicants.map(app => (app.id === updatedApplicant.id ? updatedApplicant : app))
    );
    
    console.log('✅ Setting selected applicant with updated data:', updatedApplicant);
    setSelectedApplicant(updatedApplicant);
    setActiveSection("none");
  };

  // Fetch applicants data
  useEffect(() => {
    const fetchApplicantsData = async () => {
      if (!jobId) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/opportunities/${jobId}/applicants?page=1&limit=50`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include session cookies
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication required. Please log in again.');
          } else if (response.status === 403) {
            throw new Error('Access denied. You do not have permission to view this content.');
          } else if (response.status === 429) {
            throw new Error('Too many requests. Please try again in a moment.');
          } else {
            throw new Error(`Failed to fetch applicants (${response.status})`);
          }
        }
        
        const data: ApplicantsApiResponse = await response.json();
        
        if (data.success) {
          // Enhance applicant data with UI fields and fetch tasks/interviews
          const enhancedApplicants = await Promise.all(
            data.data.applicants.map(async (applicant) => {
              const enhanced = enhanceApplicantData(applicant);
              
              // Fetch tasks for this applicant
              try {
                const tasksResponse = await fetch(`/api/tasks?opportunityId=${jobId}&applicantId=${applicant.id}`, {
                  credentials: 'include'
                });
                if (tasksResponse.ok) {
                  const tasksData = await tasksResponse.json();
                  if (tasksData.success && tasksData.data.tasks.length > 0) {
                    const latestTask = tasksData.data.tasks[0]; // Get the most recent task
                    enhanced.assignedTask = {
                      id: latestTask.id,
                      title: latestTask.title,
                      description: latestTask.description,
                      dueDate: latestTask.dueDate,
                    };
                  }
                }
              } catch (error) {
                console.warn('Failed to fetch tasks for applicant', applicant.id, error);
              }

              // Fetch interviews for this applicant
              try {
                const interviewsResponse = await fetch(`/api/interviews?opportunityId=${jobId}&applicantId=${applicant.id}`, {
                  credentials: 'include'
                });
                if (interviewsResponse.ok) {
                  const interviewsData = await interviewsResponse.json();
                  if (interviewsData.success && interviewsData.data.interviews.length > 0) {
                    const latestInterview = interviewsData.data.interviews[0]; // Get the most recent interview
                    enhanced.scheduledInterview = {
                      id: latestInterview.id, // Store ID
                      date: new Date(latestInterview.scheduledDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }),
                      time: latestInterview.scheduledTime,
                      interviewer: latestInterview.interviewerName || 'TBD',
                      mode: latestInterview.modeOfInterview,
                      link: latestInterview.linkAddress,
                      notes: latestInterview.notesForCandidate,
                    };
                  }
                }
              } catch (error) {
                console.warn('Failed to fetch interviews for applicant', applicant.id, error);
              }

              return enhanced;
            })
          );
          
          setApplicants(enhancedApplicants);
          setOpportunity(data.data.opportunity);
        } else {
          throw new Error(data.message || 'Failed to fetch applicants');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching applicants:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicantsData();
  }, [jobId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setStatusDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Utility function to enhance applicant data with missing fields for UI
  const enhanceApplicantData = (applicant: ApplicantProfile): ApplicantProfile => {
    return {
      ...applicant,
      title: applicant.title || `${applicant.name} - Applicant`,
      tags: applicant.tags || ['JavaScript', 'React', 'Node.js'],
      score: applicant.score || Math.floor(Math.random() * 10) + 1,
      appliedDate: applicant.appliedDate ? 
        `${Math.floor((new Date().getTime() - new Date(applicant.appliedDate).getTime()) / (1000 * 60 * 60 * 24))} days ago` : 
        'Recently'
    };
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "all", label: `All Applicants (${applicants.length})` },
    { id: "shortlisted", label: `Shortlisted (${applicants.filter(app => app.status === 'SHORTLISTED').length})` },
    { id: "final", label: `Final Selections (${applicants.filter(app => app.status === 'FINAL').length})` },
    { id: "rejected", label: `Rejected (${applicants.filter(app => app.status === 'REJECTED').length})` },
  ];

  const filters = [
    { id: "all", label: "All", count: `(${applicants.length})` },
    { id: "strong", label: "Strong Fit", count: `(${applicants.filter(app => app.score && app.score >= 8).length})` },
    { id: "good", label: "Good Fit", count: `(${applicants.filter(app => app.score && app.score >= 6 && app.score < 8).length})` },
    { id: "potential", label: "Potential", count: `(${applicants.filter(app => app.score && app.score >= 4 && app.score < 6).length})` },
    { id: "consider", label: "Consider", count: `(${applicants.filter(app => app.score && app.score >= 2 && app.score < 4).length})` },
    { id: "declined", label: "Declined", count: `(${applicants.filter(app => app.status === 'REJECTED').length})` },
  ];

  // Get filtered applicants based on selected tab
  const getFilteredApplicants = () => {
    let filtered = applicants;
    
    // Filter by tab first
    switch (selectedTab) {
      case "shortlisted":
        filtered = applicants.filter(app => app.status === 'SHORTLISTED');
        break;
      case "final":
        filtered = applicants.filter(app => app.status === 'FINAL');
        break;
      case "rejected":
        filtered = applicants.filter(app => app.status === 'REJECTED');
        break;
      default:
        filtered = applicants;
    }

    // Apply score-based filters (now works on all tabs including shortlisted)
    if (selectedFilter !== "All") {
      switch (selectedFilter) {
        case "Strong Fit":
          filtered = filtered.filter(app => app.score && app.score >= 8);
          break;
        case "Good Fit":
          filtered = filtered.filter(app => app.score && app.score >= 6 && app.score < 8);
          break;
        case "Potential":
          filtered = filtered.filter(app => app.score && app.score >= 4 && app.score < 6);
          break;
        case "Consider":
          filtered = filtered.filter(app => app.score && app.score >= 2 && app.score < 4);
          break;
        case "Declined":
          filtered = filtered.filter(app => app.status === 'REJECTED');
          break;
      }
    }

    return filtered;
  };

  const filteredApplicants = getFilteredApplicants();

  const handleAssignTask = async (taskDetails: { title: string; description: string; dueDate: string; tags: string[]; uploadedFileName: string | null }) => {
    if (!selectedApplicant) return;

    try {
      let apiUrl;
      let method;
      let bodyData;

      if (editingTask) {
        // Update existing task
        apiUrl = `/api/tasks/${editingTask.id}`;
        method = 'PUT';
        bodyData = {
          title: taskDetails.title,
          description: taskDetails.description,
          dueDate: taskDetails.dueDate,
          tags: taskDetails.tags,
        };
      } else {
        // Create new task
        apiUrl = '/api/tasks';
        method = 'POST';
        bodyData = {
          opportunityId: jobId,
          applicantId: selectedApplicant.id,
          title: taskDetails.title,
          description: taskDetails.description,
          dueDate: taskDetails.dueDate,
          tags: taskDetails.tags,
          uploadedFileName: taskDetails.uploadedFileName
        };
      }

             const response = await fetch(apiUrl, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(bodyData),
      });

      const result = await response.json();

      if (result.success) {
        // Update the applicant with the task data
        const updatedApplicant: ApplicantProfile = {
          ...selectedApplicant,
          assignedTask: {
            id: result.data.task.id,
            title: result.data.task.title,
            description: result.data.task.description,
            dueDate: result.data.task.dueDate,
          },
        };

        setApplicants(prevApplicants =>
          prevApplicants.map(app => (app.id === updatedApplicant.id ? updatedApplicant : app))
        );

        setSelectedApplicant(updatedApplicant);
        setIsAssignTaskModalOpen(false);
        setEditingTask(null); // Clear editing state
        setActiveSection("taskDetails");
        
        // Show success message
        alert(editingTask ? 'Task updated successfully!' : 'Task assigned successfully!');
      } else {
        throw new Error(result.message || (editingTask ? 'Failed to update task' : 'Failed to assign task'));
      }
    } catch (error) {
      console.error('Error with task:', error);
      alert(`Failed to ${editingTask ? 'update' : 'assign'} task. Please try again.`);
    }
  };

  const handleScheduleInterview = async (interviewDetails: {
    selectedDate: Date | undefined;
    selectedTime: string;
    notesForCandidate: string;
    assignInterviewer: string;
    modeOfInterview: string;
    linkAddress: string;
  }) => {
    if (!selectedApplicant) return;

    try {
      // Convert Date to ISO string for API
      const scheduledDate = interviewDetails.selectedDate ? interviewDetails.selectedDate.toISOString() : null;
      
      if (!scheduledDate) {
        alert('Please select a valid date for the interview.');
        return;
      }

      let apiUrl;
      let method;
      let bodyData;

      if (editingInterview && editingInterview.id) {
        // Update existing interview
        apiUrl = `/api/interviews/${editingInterview.id}`;
        method = 'PUT';
        bodyData = {
          interviewerName: interviewDetails.assignInterviewer,
          scheduledDate: scheduledDate,
          scheduledTime: interviewDetails.selectedTime,
          modeOfInterview: interviewDetails.modeOfInterview,
          linkAddress: interviewDetails.linkAddress,
          notesForCandidate: interviewDetails.notesForCandidate
        };
      } else {
        // Create new interview
        apiUrl = '/api/interviews';
        method = 'POST';
        bodyData = {
          opportunityId: jobId,
          applicantId: selectedApplicant.id,
          interviewerName: interviewDetails.assignInterviewer,
          scheduledDate: scheduledDate,
          scheduledTime: interviewDetails.selectedTime,
          modeOfInterview: interviewDetails.modeOfInterview,
          linkAddress: interviewDetails.linkAddress,
          notesForCandidate: interviewDetails.notesForCandidate
        };
      }

      const response = await fetch(apiUrl, { 
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(bodyData),
      });

      const result = await response.json();

      if (result.success) {
        // Update the applicant with the interview data
        const updatedApplicant: ApplicantProfile = {
          ...selectedApplicant,
          scheduledInterview: {
            id: editingInterview?.id || result.data.interview.id,
            date: interviewDetails.selectedDate ? format(interviewDetails.selectedDate, 'PPP') : 'N/A',
            time: interviewDetails.selectedTime,
            interviewer: interviewDetails.assignInterviewer,
            mode: interviewDetails.modeOfInterview,
            link: interviewDetails.linkAddress,
            notes: interviewDetails.notesForCandidate,
          },
        };

        setApplicants(prevApplicants =>
          prevApplicants.map(app => (app.id === updatedApplicant.id ? updatedApplicant : app))
        );

        setSelectedApplicant(updatedApplicant);
        setIsScheduleInterviewModalOpen(false);
        setEditingInterview(null); // Clear editing state
        setActiveSection("interviewDetails");
        
        // Show success message
        alert(editingInterview ? 'Interview updated successfully!' : 'Interview scheduled successfully!');
      } else {
        throw new Error(result.message || (editingInterview ? 'Failed to update interview' : 'Failed to schedule interview'));
      }
    } catch (error) {
      console.error('Error with interview:', error);
      alert(`Failed to ${editingInterview ? 'update' : 'schedule'} interview. Please try again.`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading applicants...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-red-700">Error: {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-red-600 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
            <Image src="/job-icon.png" alt="Icon" width={24} height={24} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-gray-900">
              {opportunity?.role || opportunity?.title || "Job Opportunity"}
            </h1>
            <p className="text-sm text-gray-500">
              {opportunity?.institute || "Company"} • {opportunity?.location || "Remote"} •
              Needs {opportunity?.vacancies || 0}/{opportunity?.maxParticipants || 0}
            </p>
            <p className="text-sm text-gray-500">
              Posted on{" "}
              {opportunity?.regStartDate
                ? new Date(opportunity.regStartDate).toLocaleDateString("en-GB")
                : "N/A"}{" "}
              • Closing on{" "}
              {opportunity?.regEndDate
                ? new Date(opportunity.regEndDate).toLocaleDateString("en-GB")
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Job Status, Buttons, and Dropdown */}
        <div className="flex items-center gap-2 flex-wrap" ref={statusRef}>
          <button
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              jobStatus === "Live"
                ? "bg-green-100 text-green-800"
                : "bg-gray-200 text-gray-600"
            }`}
            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
          >
            {jobStatus} ▼
          </button>
          {statusDropdownOpen && (
            <div className="absolute mt-1 bg-white border rounded shadow z-10 w-32">
              <button
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                onClick={() => {
                  setJobStatus("Live");
                  setStatusDropdownOpen(false);
                }}
              >
                Live
              </button>
              <button
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                onClick={() => {
                  setJobStatus("Closed");
                  setStatusDropdownOpen(false);
                }}
              >
                Closed
              </button>
            </div>
          )}
          <Button variant="outline" size="sm" className="text-gray-700">
            Job Details
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:bg-gray-100"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Job link copied to clipboard!");
            }}
          >
            <Share2 className="w-5 h-5" />
          </Button>


          <div className="relative" ref={menuRef}>
  <button
    className="p-2 hover:bg-gray-100 rounded-full"
    onClick={() => setJobMenuOpen(!jobMenuOpen)}
  >
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 13a1 1 0 100-2 1 1 0 000 2zM19 13a1 1 0 100-2 1 1 0 000 2zM5 13a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  </button>

  {jobMenuOpen && (
    <div className="absolute right-0 mt-1 bg-white border rounded shadow z-10 w-40">
      <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
        Edit Job
      </button>
      <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
        Delete Job
      </button>
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
              onClick={() => {
                setSelectedTab(tab.id);
                setSelectedApplicant(null);
                setActiveSection("none");
              }}
              className={`py-2 md:py-4 px-1 relative ${
                selectedTab === tab.id
                  ? "text-[#6366F1] font-medium"
                  : "text-gray-500 hover:text-gray-700"
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
      <div className="flex flex-wrap gap-2 md:gap-4 mb-4 md:mb-6">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.label)}
            className={`px-3 md:px-4 py-1.5 rounded-full text-sm font-medium ${
              selectedFilter === filter.label
                ? "bg-[#6366F1] text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {filter.label} {filter.count}
          </button>
        ))}

        <Button
          variant="outline"
          size="sm"
          className="ml-auto flex items-center gap-2 text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <SlidersHorizontal className="w-4 h-4" /> Shortlist by filters
        </Button>
      </div>
      {/* Applicant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Column */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
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
                onClick={() => {
                  handleApplicantSelection(applicant);
                }}
                  className={`flex gap-4 cursor-pointer p-4 border-l-4 rounded-r-lg mb-3 transition-all ${
                    isSelected 
                      ? "border-blue-500 bg-blue-50 shadow-sm" 
                      : "border-transparent hover:bg-gray-50 hover:border-gray-200"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-600">
                      {applicant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{applicant.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{applicant.title}</p>
                    <div className="text-sm text-blue-600 mt-1 flex flex-wrap gap-x-2">
                      {applicant.tags?.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="bg-blue-100 px-2 py-0.5 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between text-sm text-gray-500">
                    <span>Applied {applicant.appliedDate}</span>
                      <span className={`font-semibold ${
                        applicant.score && applicant.score >= 8 ? 'text-green-600' :
                        applicant.score && applicant.score >= 6 ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        Score: {applicant.score}
                      </span>
                    </div>
                    <div className="mt-1">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        applicant.status === 'SHORTLISTED' ? 'bg-blue-100 text-blue-800' :
                        applicant.status === 'FINAL' ? 'bg-green-100 text-green-800' :
                        applicant.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {applicant.status}
                      </span>
                    </div>
                </div>
              </div>
            );
            })
          )}
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow p-4 md:p-6">
          {selectedApplicant ? (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                    {selectedApplicant.name}
                  </h2>
                  <p className="text-sm text-gray-700 mt-1">{selectedApplicant.title}</p>
                </div>
                <div className="text-gray-500 text-xl font-bold">⋯</div>
              </div>

              <div className="flex flex-wrap gap-2 text-sm text-indigo-600 font-medium mt-4">
                {selectedApplicant.tags?.map((tag, idx) => (
                  <span key={idx}>{tag}</span>
                ))}
              </div>

              <div className="flex flex-wrap justify-between items-center gap-4 mt-4">
                {/* Left section: tabs */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Profile", key: "profile" },
                    { label: "Resume/ CV", key: "resume" },
                    { label: "Contacts", key: "contact" },
                    { 
                      label: `${Object.values(selectedApplicant.documents?.summary || {}).filter(Boolean).length} files ▼`, 
                      key: "files" 
                    },
                  ].map(({ label, key }) => (
                    <button
                      key={key}
                      onClick={() => setActiveSection(activeSection === key ? "none" : (key as Section))}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium border ${
                        activeSection === key
                          ? "border-blue-600 text-blue-600 bg-blue-50"
                          : "text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Right section: Action Buttons based on Tab */}
                {selectedTab === "all" && (
                  <div className="flex gap-2 relative">
                    <div className="relative">
                      <button
                        className="rounded-full px-4 py-1.5 text-sm font-medium border border-blue-600 text-blue-600 hover:bg-blue-50"
                        onClick={() => setMarkAsOpen(!markAsOpen)}
                      >
                        Mark as <span className="ml-1">▼</span>
                      </button>

                      {markAsOpen && (
                        <div className="absolute top-full mt-2 left-0 bg-white border shadow-md rounded-md z-20 w-40">
                          <button
  className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
  onClick={() => handleUpdateStatus("REJECTED")}
>
  Reject
</button>
                          <button
  className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
  onClick={() => handleUpdateStatus("MAYBE")}
>
  Maybe
</button>

                        </div>
                      )}
                    </div>

                    <button
                      className="rounded-md bg-[#6366F1] text-white px-4 py-1.5 text-sm hover:bg-indigo-700"
                      onClick={handleShortlist}
                    >
                      Shortlist
                    </button>
                  </div>
                )}

                {selectedTab === "shortlisted" && (
                  <div className="flex gap-2">
                    <div className="relative">
                      <button className="rounded-full px-4 py-1.5 text-sm font-medium border border-blue-600 text-blue-600 hover:bg-blue-50">
                        Shortlist <span className="ml-1">▼</span>
                      </button>
                    </div>
                    <button className="rounded-md bg-[#6366F1] text-white px-4 py-1.5 text-sm hover:bg-indigo-700">
                      Finalize
                    </button>
                  </div>
                )}
              </div>

   {/* Task and Interview buttons for shortlisted */}
{selectedTab === "shortlisted" && selectedApplicant && (
  <div className="flex justify-end gap-2 mt-8">
    {/* View or Assign Task Button */}
    {selectedApplicant.assignedTask ? (
      <button
        className="rounded-full px-4 py-1.5 text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100"
        onClick={handleViewTaskDetails}
      >
        View Task
      </button>
    ) : (
      <button
        className="rounded-full px-4 py-1.5 text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-1"
        onClick={handleAssignNewTask}
      >
        Assign Task <span className="ml-1 text-base">+</span>
      </button>
    )}

    {/* Schedule or View Interview Button */}
    {selectedApplicant.scheduledInterview ? (
      <button
        className="rounded-md bg-[#6366F1] text-white px-4 py-1.5 text-sm hover:bg-indigo-700 flex items-center gap-1"
        onClick={handleViewInterviewDetails}
      >
        Interview Scheduled <span className="ml-1 text-base">🗓️</span>
      </button>
    ) : (
      <button
        className="rounded-md bg-[#6366F1] text-white px-4 py-1.5 text-sm hover:bg-indigo-700 flex items-center gap-1"
        onClick={handleScheduleNewInterview}
      >
        Schedule Interview <span className="ml-1 text-base">🗓️</span>
      </button>
    )}

    {/* ✅ Show Edit button only if at least one action is available */}
    {(selectedApplicant.assignedTask || selectedApplicant.scheduledInterview) && (
      <div className="relative" ref={menuRef}>
        <button
          className="rounded-full p-2 border border-gray-300 text-gray-700 hover:bg-gray-100"
          onClick={() => {
            console.log('Edit menu clicked, current state:', menuOpen);
            setMenuOpen(prev => !prev);
          }}
          title="Edit Options"
        >
          <Pencil className="w-4 h-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow z-50">
            {selectedApplicant.assignedTask && (
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={(e) => {
                  console.log('Edit task clicked');
                  e.stopPropagation();
                  handleEditTask();
                }}
              >
                ✏️ Edit Assigned Task
              </button>
            )}
            {selectedApplicant.scheduledInterview && (
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={(e) => {
                  console.log('Edit interview clicked');
                  e.stopPropagation();
                  handleEditInterview();
                }}
              >
                📅 Edit Scheduled Interview
              </button>
            )}
          </div>
        )}
      </div>
    )}
  </div>
)}

              {/* Content sections */}
              {activeSection === "profile" && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold mb-4">Profile Summary</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Name:</span>
                      <span className="ml-2 text-gray-900">{selectedApplicant.name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="ml-2 text-gray-900">{selectedApplicant.email}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">User ID:</span>
                      <span className="ml-2 text-gray-900">{selectedApplicant.userId}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Application Status:</span>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        selectedApplicant.status === 'SHORTLISTED' ? 'bg-blue-100 text-blue-800' :
                        selectedApplicant.status === 'FINAL' ? 'bg-green-100 text-green-800' :
                        selectedApplicant.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedApplicant.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Applied Date:</span>
                      <span className="ml-2 text-gray-900">{selectedApplicant.appliedDate}</span>
                    </div>
                    {selectedApplicant.score && (
                      <div>
                        <span className="font-medium text-gray-700">Score:</span>
                        <span className={`ml-2 font-semibold ${
                          selectedApplicant.score >= 8 ? 'text-green-600' :
                          selectedApplicant.score >= 6 ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {selectedApplicant.score}/10
                        </span>
                      </div>
                    )}
                    {selectedApplicant.tags && selectedApplicant.tags.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">Skills/Tags:</span>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {selectedApplicant.tags.map((tag, idx) => (
                            <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeSection === "resume" && (
                <div className="mt-6">
                  {selectedApplicant.documents?.summary?.cv ? (
                    (() => {
                      const cvUrl = selectedApplicant.documents.summary.cv;
                      const isValidUrl = cvUrl.startsWith('http://') || cvUrl.startsWith('https://') || cvUrl.startsWith('data:');
                      
                      if (isValidUrl) {
                        return (
                          <div className="w-full h-[500px] md:h-[700px]">
                            <iframe
                              src={cvUrl}
                              className="w-full h-full rounded-md border"
                              title="Resume PDF"
                              onError={() => {
                                console.error('Failed to load resume:', cvUrl);
                              }}
                            />
                          </div>
                        );
                      } else {
                        return (
                          <div className="text-center py-12 text-gray-500">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                              <div className="flex items-center">
                                <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <span className="text-yellow-800 font-medium">Invalid Resume URL</span>
                              </div>
                              <p className="text-yellow-700 mt-1 text-sm">
                                The resume URL is not valid: {cvUrl}
                              </p>
                            </div>
                            <p>Unable to display resume/CV due to invalid URL.</p>
                          </div>
                        );
                      }
                    })()
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p>No resume/CV available for this applicant.</p>
                    </div>
                  )}
                </div>
              )}

              {activeSection === "files" && (
                <div className="mt-6 bg-gray-50 border rounded-md p-4">
                  <h4 className="text-md font-semibold mb-3">Documents</h4>
                  {selectedApplicant.documents?.summary ? (
                    <div className="space-y-2">
                      {Object.entries(selectedApplicant.documents.summary).map(([docType, docUrl]) => {
                        if (!docUrl) return null;
                        
                        const docTypeLabels: Record<string, string> = {
                          cv: 'Resume/CV',
                          portfolio: 'Portfolio',
                          sops: 'Statement of Purpose',
                          lor: 'Letter of Recommendation',
                          researchProposal: 'Research Proposal',
                          coverLetter: 'Cover Letter'
                        };
                        
                        // Check if the URL is valid (starts with http/https or is a data URL)
                        const isValidUrl = docUrl.startsWith('http://') || docUrl.startsWith('https://') || docUrl.startsWith('data:');
                        
                        if (isValidUrl) {
                          return (
                            <a
                              key={docType}
                              href={docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 bg-white rounded border hover:bg-gray-50 transition-colors"
                            >
                              <span className="text-indigo-600 font-medium">
                                {docTypeLabels[docType] || docType}
                              </span>
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          );
                        } else {
                          // For invalid URLs, show a disabled link with a message
                          return (
                            <div
                              key={docType}
                              className="flex items-center justify-between p-3 bg-gray-100 rounded border opacity-50"
                              title={`Invalid document URL: ${docUrl}`}
                            >
                              <span className="text-gray-600 font-medium">
                                {docTypeLabels[docType] || docType} (Invalid URL)
                              </span>
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                            </div>
                          );
                        }
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500">No documents available for this applicant.</p>
                  )}
                </div>
              )}

              {activeSection === "contact" && (
                <div id="contact-info" className="mt-6">
                  <h4 className="text-md font-semibold mb-4">Contact Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V6a2 2 0 00-2-2H3a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <span className="ml-2 text-gray-900">{selectedApplicant.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div>
                        <span className="font-medium text-gray-700">User ID:</span>
                        <span className="ml-2 text-gray-900 font-mono text-sm">{selectedApplicant.userId}</span>
                      </div>
                    </div>
                    {selectedApplicant.image && (
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <span className="font-medium text-gray-700">Profile Image:</span>
                          {(() => {
                            const imageUrl = selectedApplicant.image;
                            const isValidUrl = imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:');
                            
                            if (isValidUrl) {
                              return (
                                <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline">
                                  View Image
                                </a>
                              );
                            } else {
                              return (
                                <span className="ml-2 text-gray-500" title={`Invalid image URL: ${imageUrl}`}>
                                  Invalid URL
                                </span>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeSection === "taskDetails" && selectedApplicant?.assignedTask && (
                <div className="mt-6 p-4 border rounded-md bg-blue-50">
                  <h4 className="text-md font-semibold mb-2 text-blue-800">Assigned Task Details</h4>
                  <p className="text-gray-800">
                    <span className="font-medium">Task Title:</span> {selectedApplicant.assignedTask.title}
                  </p>
                  <p className="text-gray-800 mt-1">
                    <span className="font-medium">Description:</span> {selectedApplicant.assignedTask.description}
                  </p>
                  <p className="text-gray-800 mt-1">
                    <span className="font-medium">Due Date:</span> {selectedApplicant.assignedTask.dueDate}
                  </p>
                </div>
              )}

              {activeSection === "interviewDetails" && selectedApplicant?.scheduledInterview && (
                <div className="mt-6 p-4 border rounded-md bg-green-50">
                  <h4 className="text-md font-semibold mb-2 text-green-800">Interview Details</h4>
                  <p className="text-gray-800">
                    <span className="font-medium">Date:</span> {selectedApplicant.scheduledInterview.date}
                  </p>
                  <p className="text-gray-800 mt-1">
                    <span className="font-medium">Time:</span> {selectedApplicant.scheduledInterview.time}
                  </p>
                  <p className="text-gray-800 mt-1">
                    <span className="font-medium">Interviewer:</span> {selectedApplicant.scheduledInterview.interviewer}
                  </p>
                  <p className="text-gray-800 mt-1">
                    <span className="font-medium">Mode:</span> {selectedApplicant.scheduledInterview.mode}
                  </p>
                  {selectedApplicant.scheduledInterview.link && (
                    <p className="text-gray-800 mt-1">
                      <span className="font-medium">Link:</span> 
                      {(() => {
                        const linkUrl = selectedApplicant.scheduledInterview.link;
                        const isValidUrl = linkUrl.startsWith('http://') || linkUrl.startsWith('https://');
                        
                        if (isValidUrl) {
                          return (
                            <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                              {linkUrl}
                            </a>
                          );
                        } else {
                          return (
                            <span className="ml-1 text-gray-500" title={`Invalid link URL: ${linkUrl}`}>
                              {linkUrl} (Invalid URL)
                            </span>
                          );
                        }
                      })()}
                    </p>
                  )}
                  {selectedApplicant.scheduledInterview.notes && (
                    <p className="text-gray-800 mt-1">
                      <span className="font-medium">Notes:</span> {selectedApplicant.scheduledInterview.notes}
                    </p>
                  )}
                </div>
              )}

            </>
          ) : (
            <p className="text-gray-500">Select an applicant to view details.</p>
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