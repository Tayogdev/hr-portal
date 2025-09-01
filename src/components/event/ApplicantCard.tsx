import React from "react";
import Image from "next/image";
import { ApplicantProfile } from "@/types/event/eventDetail";

interface ApplicantCardProps {
  applicant: ApplicantProfile;
  isSelected: boolean;
  onSelect: (applicant: ApplicantProfile) => void;
}

export default function ApplicantCard({
  applicant,
  isSelected,
  onSelect,
}: ApplicantCardProps) {
  return (
    <div
      onClick={() => onSelect(applicant)}
      className={`flex gap-4 cursor-pointer p-4 border-l-4 rounded-r-lg mb-3 transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-sm"
          : "border-transparent hover:bg-gray-50 hover:border-gray-200"
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
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-sm">
          {applicant.name}
        </h3>
        <p className="text-sm text-gray-600 mb-1">
          {applicant.title || applicant.type}
        </p>
        <div className="text-sm text-blue-600 mt-1 flex flex-wrap gap-x-2">
          {applicant.tags?.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="bg-blue-100 px-2 py-0.5 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-2 text-sm text-gray-500">
          <span>Applied {applicant.appliedDate || "N/A"}</span>
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          <span
            className={`inline-block px-2 py-1 text-xs rounded-full ${
              applicant.status === "SHORTLISTED"
                ? "bg-purple-100 text-purple-700"
                : applicant.status === "REJECTED"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-600"
            }`}
          >
            {applicant.status === "SHORTLISTED"
              ? "Approved"
              : applicant.status === "REJECTED"
                ? "Rejected"
                : applicant.status}
          </span>
          {applicant.status === "SHORTLISTED" && applicant.bookingStatus && (
            <span
              className={`inline-block px-2 py-1 text-xs rounded-full ${
                applicant.bookingStatus === "SUCCESS"
                  ? "bg-green-100 text-green-700"
                  : applicant.bookingStatus === "PENDING"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {applicant.bookingStatus === "SUCCESS" ? "Paid" : "Pending"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
