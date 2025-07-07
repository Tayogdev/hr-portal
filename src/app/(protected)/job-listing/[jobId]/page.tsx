"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Share2, SlidersHorizontal } from "lucide-react";
import { useParams } from "next/navigation";
import { AssignTaskModal } from './AssignTaskModal';
import { ScheduleInterviewModal } from './ScheduleInterviewModal';
import { format } from "date-fns";
import { ApplicantProfile, OpportunityDetails, ApplicantsApiResponse } from "@/types/applicants";

type TabId = "all" | "shortlisted" | "final" | "rejected";
type Section = "none" | "profile" | "resume" | "contact" | "files" | "taskDetails" | "interviewDetails";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params?.jobId as string;
  
  const [markAsOpen, setMarkAsOpen] = useState(false);
  const [applicants, setApplicants] = useState<ApplicantProfile[]>([]);
  const [shortlistedApplicants, setShortlistedApplicants] = useState<ApplicantProfile[]>([]);
  const [opportunity, setOpportunity] = useState<OpportunityDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [isScheduleInterviewModalOpen, setIsScheduleInterviewModalOpen] = useState(false);

  const [selectedTab, setSelectedTab] = useState<TabId>("all");
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantProfile | null>(null);
  const [jobStatus, setJobStatus] = useState<"Live" | "Closed">("Live");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("none");

  const statusRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
          // Enhance applicant data with UI fields
          const enhancedApplicants = data.data.applicants.map(enhanceApplicantData);
          setApplicants(enhancedApplicants);
          setOpportunity(data.data.opportunity);
          
          // Set shortlisted applicants based on status
          const shortlisted = enhancedApplicants.filter(app => app.status === 'SHORTLISTED');
          setShortlistedApplicants(shortlisted);
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
    
    // Filter by tab
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

    // Apply additional filters if not on shortlisted tab
    if (selectedTab !== "shortlisted" && selectedFilter !== "All") {
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

  const handleAssignTask = (taskDetails: { title: string; description: string; dueDate: string }) => {
    if (selectedApplicant) {
      const updatedApplicant: ApplicantProfile = {
        ...selectedApplicant,
        assignedTask: {
          id: `task-${Date.now()}`,
          ...taskDetails,
        },
      };

      setApplicants(prevApplicants =>
        prevApplicants.map(app => (app.id === updatedApplicant.id ? updatedApplicant : app))
      );

      setSelectedApplicant(updatedApplicant);
      setIsAssignTaskModalOpen(false);
      setActiveSection("taskDetails");
    }
  };

  const handleScheduleInterview = (interviewDetails: {
    selectedDate: Date | undefined;
    selectedTime: string;
    notesForCandidate: string;
    assignInterviewer: string;
    modeOfInterview: string;
    linkAddress: string;
  }) => {
    if (selectedApplicant) {
      const updatedApplicant: ApplicantProfile = {
        ...selectedApplicant,
        scheduledInterview: {
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
      setActiveSection("interviewDetails");
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
              {opportunity?.role || opportunity?.title || 'Job Opportunity'}
            </h1>
            <p className="text-sm text-gray-500">
              {opportunity?.institute || 'Company'} • {opportunity?.location || 'Remote'} • 
              Needs {opportunity?.vacancies || 0}/{opportunity?.maxParticipants || 0}
            </p>
            <p className="text-sm text-gray-500">
              Posted on {opportunity?.regStartDate ? new Date(opportunity.regStartDate).toLocaleDateString('en-GB') : 'N/A'} • 
              Closing on {opportunity?.regEndDate ? new Date(opportunity.regEndDate).toLocaleDateString('en-GB') : 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap" ref={statusRef}>
          <button
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              jobStatus === "Live" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
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
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 13a1 1 0 100-2 1 1 0 000 2zM19 13a1 1 0 100-2 1 1 0 000 2zM5 13a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
            </button>
            {menuOpen && (
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
        {selectedTab !== "shortlisted" && (
          <>
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
          </>
        )}

        {selectedTab !== "shortlisted" && (
          <Button
            variant="outline"
            size="sm"
            className="ml-auto flex items-center gap-2 text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-4 h-4" /> Shortlist by filters
          </Button>
        )}
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
                  setSelectedApplicant(applicant);
                    setActiveSection("none");
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
                    { label: "2 files ▼", key: "files" },
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
                            onClick={() => {
                              alert("Marked as Rejected");
                              setMarkAsOpen(false);
                            }}
                          >
                            Reject
                          </button>
                          <button
                            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                            onClick={() => {
                              alert("Marked as Maybe");
                              setMarkAsOpen(false);
                            }}
                          >
                            Maybe
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      className="rounded-md bg-[#6366F1] text-white px-4 py-1.5 text-sm hover:bg-indigo-700"
                      onClick={() => {
                        if (selectedApplicant) {
                          if (!shortlistedApplicants.some(app => app.id === selectedApplicant.id)) {
                               setShortlistedApplicants((prev) => [...prev, selectedApplicant]);
                           }
                           setSelectedTab("shortlisted");
                        }
                      }}
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
    {selectedApplicant.assignedTask ? (
      <button
        className="rounded-full px-4 py-1.5 text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-1"
        onClick={() => setActiveSection("taskDetails")}
      >
        View Task
      </button>
    ) : (
      <button
        className="rounded-full px-4 py-1.5 text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-1"
        onClick={() => setIsAssignTaskModalOpen(true)}
      >
        Assign Task <span className="ml-1 text-base">+</span>
      </button>
    )}

    {selectedApplicant.scheduledInterview ? (
      <button
        className="rounded-md bg-[#6366F1] text-white px-4 py-1.5 text-sm hover:bg-indigo-700 flex items-center gap-1"
        onClick={() => setActiveSection("interviewDetails")}
      >
        Interview Scheduled <span className="ml-1 text-base">🗓️</span>
      </button>
    ) : (
      <button
        className="rounded-md bg-[#6366F1] text-white px-4 py-1.5 text-sm hover:bg-indigo-700 flex items-center gap-1"
        onClick={() => setIsScheduleInterviewModalOpen(true)}
      >
        Schedule Interview <span className="ml-1 text-base">🗓️</span>
      </button>
    )}
  </div>
)}

              {/* Content sections */}
              {activeSection === "profile" && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold mb-2">Profile Summary</h4>
                  <p className="text-gray-700 text-sm">Applicant profile information</p>
                </div>
              )}

              {activeSection === "resume" && (
                <div className="mt-6 w-full h-[500px] md:h-[700px]">
                  <iframe
                    src="/resume-sample.pdf"
                    className="w-full h-full rounded-md border"
                    title="Resume PDF"
                  />
                </div>
              )}

              {activeSection === "files" && (
                <div className="mt-6 bg-gray-50 border rounded-md p-4 space-y-2">
                  <a
                    href="/portfolio.pdf"
                    target="_blank"
                    className="block text-indigo-600 hover:underline"
                  >
                    Portfolio.pdf
                  </a>
                  <a
                    href="/case-study.pdf"
                    target="_blank"
                    className="block text-indigo-600 hover:underline"
                  >
                    Case Study.pdf
                  </a>
                </div>
              )}

              {activeSection === "contact" && (
                <div id="contact-info" className="mt-10">
                  <h4 className="text-md font-semibold mb-2">Contact Info</h4>
                  <p>Email: {selectedApplicant.email}</p>
                  <p>User ID: {selectedApplicant.userId}</p>
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
                      <a href={selectedApplicant.scheduledInterview.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                        {selectedApplicant.scheduledInterview.link}
                      </a>
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
        onClose={() => setIsAssignTaskModalOpen(false)}
        selectedApplicantName={selectedApplicant?.name}
        onAssignTask={handleAssignTask}
      />

      <ScheduleInterviewModal
        isOpen={isScheduleInterviewModalOpen}
        onClose={() => setIsScheduleInterviewModalOpen(false)}
        selectedApplicantName={selectedApplicant?.name}
        onScheduleInterview={handleScheduleInterview}
      />
    </div>
  );
}