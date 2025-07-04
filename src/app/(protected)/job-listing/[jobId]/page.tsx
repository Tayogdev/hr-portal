// app/job/[jobId]/page.tsx
"use client";

<<<<<<< Updated upstream
import React, { useState, useEffect, useRef, use } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Share2, SlidersHorizontal } from "lucide-react";
=======
import React, { useState, useEffect, useRef, use } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Share2, SlidersHorizontal } from 'lucide-react';
import ApplicantList from '../../pages/joblistingmodule/ApplicantList';
>>>>>>> Stashed changes

type TabId = "all" | "shortlisted" | "final" | "rejected";

type Opportunity = {
  id: string;
  role: string;
  institute: string;
  location: string;
  vacancies: number;
  maxParticipants: number;
  regStartDate: string;
  regEndDate: string;
  status: 'Live' | 'Closed';
};

<<<<<<< Updated upstream
const mockApplicants: Applicant[] = [
  {
    id: 1,
    name: 'Gatikrushna Mohapatra',
    title: 'UI/UX Designer, Pursuing Bachelors of Design from IIT Hyderabad',
    score: 10,
    tags: ['UI Design', 'Dashboard Design', 'Web design', 'User research', 'UX design'],
    appliedDate: '26 days ago',
  },
  {
    id: 2,
    name: 'Ananya Sharma',
    title: 'Frontend Developer Intern, IIIT Bangalore',
    score: 9,
    tags: ['React.js', 'Tailwind CSS', 'Next.js', 'UI/UX'],
    appliedDate: '18 days ago',
  },
  {
    id: 3,
    name: 'Rohit Jain',
    title: 'Software Developer Trainee, NIT Trichy',
    score: 8,
    tags: ['JavaScript', 'Node.js', 'MongoDB', 'REST APIs'],
    appliedDate: '12 days ago',
  },
  {
    id: 4,
    name: 'Meera Iyer',
    title: 'Data Analyst, pursuing B.Tech in Data Science from VIT',
    score: 9,
    tags: ['Python', 'Pandas', 'SQL', 'Power BI', 'Statistics'],
    appliedDate: '8 days ago',
  },
  {
    id: 5,
    name: 'Amit Kumar',
    title: 'DevOps Intern at TCS, Final year student - B.E. CS',
    score: 7,
    tags: ['Docker', 'Kubernetes', 'CI/CD', 'AWS'],
    appliedDate: '4 days ago',
  },
];

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const resolvedParams = use(params);
  const [selectedTab, setSelectedTab] = useState<TabId>("all");
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    mockApplicants[0]
  );
  const [jobStatus, setJobStatus] = useState<"Live" | "Closed">("Live");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "none" | "profile" | "resume" | "contact" | "files" | "shortlist"
  >("none");
=======
export default function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const resolvedParams = use(params);
  const [selectedTab, setSelectedTab] = useState<TabId>('all');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [selectedApplicantIndex, setSelectedApplicantIndex] = useState<number>(0);
  const [jobStatus, setJobStatus] = useState<'Live' | 'Closed'>('Live');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'none' | 'profile' | 'resume' | 'contact' | 'files' | 'shortlist'>('none');
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
>>>>>>> Stashed changes

  const statusRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/opportunities/${resolvedParams.jobId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch opportunity details');
        }

        setOpportunity(data.data);
        setJobStatus(data.data.status);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch opportunity details');
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams.jobId) {
      fetchOpportunity();
    }
  }, [resolvedParams.jobId]);

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

<<<<<<< Updated upstream
 const tabs: { id: TabId; label: string }[] = [
  { id: 'all', label: 'All Applicants (80)' },
  { id: 'shortlisted', label: 'Shortlisted (4)' },
  { id: 'final', label: 'Final Selections (0)' },
  { id: 'rejected', label: 'Rejected (0)' },
];


  const filters = [
    { id: "all", label: "All", count: "(80)" },
    { id: "strong", label: "Strong Fit", count: "(8)" },
    { id: "good", label: "Good Fit", count: "(16)" },
    { id: "potential", label: "Potential", count: "(32)" },
    { id: "consider", label: "Consider", count: "(16)" },
    { id: "declined", label: "Declined", count: "(8)" },
=======
  const tabs = [
    { id: 'all' as TabId, label: 'All Applicants' },
    { id: 'shortlisted', label: 'Shortlisted' },
    { id: 'final', label: 'Final Selections' },
    { id: 'rejected', label: 'Rejected' },
  ];

  const filters = [
    { id: 'all', label: 'All', status: 'ALL' },
    { id: 'strong', label: 'Strong Fit', status: 'STRONG_FIT' },
    { id: 'good', label: 'Good Fit', status: 'GOOD_FIT' },
    { id: 'rejected', label: 'Rejected', status: 'REJECTED' },
    { id: 'final', label: 'Final', status: 'FINAL' },
>>>>>>> Stashed changes
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500">Loading job details...</div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-red-500">{error || 'Failed to load job details'}</div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
<<<<<<< Updated upstream
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
            <Image src="/job-icon.png" alt="Icon" width={24} height={24} />
=======
    <div className="p-6">
      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#F3F4F6] flex items-center justify-center">
              <Image src="/job-icon.png" alt="Company Logo" width={24} height={24} className="rounded" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{opportunity.role}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{opportunity.institute}</span>
                <span>•</span>
                <span>{opportunity.location}</span>
                <span>•</span>
                <span>Needs {opportunity.vacancies}/{opportunity.maxParticipants}</span>
              </div>
              <div className="text-sm text-gray-500">
                Posted on {formatDate(opportunity.regStartDate)} • 
                Closing on {formatDate(opportunity.regEndDate)}
              </div>
            </div>
>>>>>>> Stashed changes
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-gray-900">
              User Experience and Research Intern
            </h1>
            <p className="text-sm text-gray-500">
              Tech Japan • Remote • Needs 0/1
            </p>
            <p className="text-sm text-gray-500">
              Posted on 08.07.2024 • Closing on 19.08.2024
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
<<<<<<< Updated upstream
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
=======
              onClick={() => { setSelectedTab(tab.id as TabId); setSelectedApplicantIndex(0); setActiveSection('none'); }}
              className={`py-4 px-1 relative ${selectedTab === tab.id ? 'text-[#6366F1] font-medium' : 'text-gray-500 hover:text-gray-700'}`}
>>>>>>> Stashed changes
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
            {filter.label}
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

      {/* Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Column: Applicants */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Applicants</h2>
<<<<<<< Updated upstream
          {mockApplicants.map((applicant) => {
            const isSelected = selectedApplicant?.id === applicant.id;
            return (
              <div
                key={applicant.id}
                onClick={() => {
                  setSelectedApplicant(applicant);
                  setActiveSection("none");
                }}
                className={`flex gap-4 cursor-pointer p-4 border-l-4 ${
                  isSelected ? "border-[#4F46E5] bg-gray-50" : "border-transparent"
                } hover:bg-gray-50`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src="/avatar-placeholder.png"
                    alt={applicant.name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {applicant.name}
                  </h3>
                  <p className="text-sm text-gray-600">{applicant.title}</p>
                  <div className="text-sm text-[#6366F1] mt-1 flex flex-wrap gap-x-1">
                    {applicant.tags.map((tag, idx) => (
                      <span key={idx} className="text-blue-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between text-sm text-gray-500">
                    <span>Applied {applicant.appliedDate}</span>
                    <span className="text-green-600 font-semibold">
                      Score: {applicant.score}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Applicant Details */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow p-4 md:p-6">
          {selectedApplicant ? (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                    {selectedApplicant.name}
                  </h2>
                  <p className="text-sm text-gray-700 mt-1">
                    {selectedApplicant.title}
                  </p>
                </div>
                <div className="text-gray-500 text-xl font-bold">⋯</div>
              </div>

              <div className="flex flex-wrap gap-2 text-sm text-indigo-600 font-medium mt-4">
                {selectedApplicant.tags.map((tag, idx) => (
                  <span key={idx}>{tag}</span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 justify-between items-center mt-4">
                <div className="flex gap-2 flex-wrap">
                  {["profile", "resume", "contact", "files"].map((section) => (
                    <button
                      key={section}
                      onClick={() =>
                        setActiveSection(activeSection === section ? "none" : section as any)
                      }
                      className="rounded-full border px-4 py-1 text-sm text-gray-700 border-gray-300 hover:bg-gray-100"
                    >
                      {section === "files" ? "2 files ▼" : section.charAt(0).toUpperCase() + section.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {activeSection === "profile" && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold mb-2">Profile Summary</h4>
                  <p className="text-gray-700 text-sm">Hi Raj, how are you?</p>
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
                  <p>Email: example@example.com</p>
                  <p>Phone: +91 1234567890</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500">Select an applicant to view details.</p>
          )}
=======
          <ApplicantList 
            selected={selectedApplicantIndex} 
            opportunityId={resolvedParams.jobId} 
          />
        </div>

        {/* Right side panel for applicant details */}
        <div className="col-span-2 bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Applicant Details</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Message</Button>
              <Button variant="outline" size="sm">Schedule Interview</Button>
                </div>
              </div>

          {/* Add your applicant details content here */}
          <div className="text-gray-500 text-center py-8">
            Select an applicant to view their details
                </div>
>>>>>>> Stashed changes
        </div>
      </div>
    </div>
  );
}
