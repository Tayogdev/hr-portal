import React from "react";
import { ApplicantProfile } from "@/types/event/eventDetail";
import ApplicantCard from "./ApplicantCard";

interface ApplicantsPanelProps {
  filteredApplicants: ApplicantProfile[];
  selectedApplicant: ApplicantProfile | null;
  selectedFilter: string;
  onApplicantSelection: (applicant: ApplicantProfile) => void;
  onDownloadExcel: () => void;
  onFilterChange: (filter: string) => void;
}

export default function ApplicantsPanel({
  filteredApplicants,
  selectedApplicant,
  selectedFilter,
  onApplicantSelection,
  onDownloadExcel,
  onFilterChange,
}: ApplicantsPanelProps) {
  return (
    <div className="col-span-12 lg:col-span-4 bg-white rounded-lg p-4 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Applicants</h2>
        <button
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-full bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 transition-colors"
          onClick={onDownloadExcel}
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
      </div>
      {filteredApplicants.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No applicants yet
          </h3>
          <p className="text-gray-500 mb-4">
            {selectedFilter === "All"
              ? "This event doesn't have any registrations yet."
              : `No ${selectedFilter.toLowerCase()} applicants found for this filter.`}
          </p>
          {selectedFilter !== "All" && (
            <button
              onClick={() => onFilterChange("All")}
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
            <ApplicantCard
              key={applicant.id}
              applicant={applicant}
              isSelected={isSelected}
              onSelect={onApplicantSelection}
            />
          );
        })
      )}
    </div>
  );
}
