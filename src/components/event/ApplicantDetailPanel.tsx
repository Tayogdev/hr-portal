import React from "react";
import {
  ApplicantProfile,
  ActiveSectionType,
  QuestionnaireData,
} from "@/types/event/eventDetail";

interface ApplicantDetailPanelProps {
  selectedApplicant: ApplicantProfile | null;
  activeSection: ActiveSectionType;
  questionnaireData: QuestionnaireData | null;
  onSectionChange: (section: ActiveSectionType) => void;
  onApplicantSelection: (applicant: ApplicantProfile) => void;
  onSendReminder: () => void;
  onRejectApplicant: (id: string) => void;
  onHoldApplicant: (id: string) => void;
  onApproveApplicant: (id: string) => void;
  isRemindButtonDisabled: (applicant: ApplicantProfile) => boolean;
  getRemainingCooldownTime: (applicant: ApplicantProfile) => string;
}

export default function ApplicantDetailPanel({
  selectedApplicant,
  activeSection,
  questionnaireData,
  onSectionChange,
  onApplicantSelection,
  onSendReminder,
  onRejectApplicant,
  onHoldApplicant,
  onApproveApplicant,
  isRemindButtonDisabled,
  getRemainingCooldownTime,
}: ApplicantDetailPanelProps) {
  return (
    <div className="py-0.5">
      {selectedApplicant ? (
        <>
          {/* Main Box */}
          <div className="bg-white rounded-2xl shadow-xs px-6 py-8 w-full relative">
            {/* 3-dot Menu */}
            <div className="absolute top-4 right-4">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 13a1 1 0 100-2 1 1 0 000 2zM19 13a1 1 0 100-2 1 1 0 000 2zM5 13a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
              </button>
            </div>

            {/* Applicant Info */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {selectedApplicant.name}
              </h2>
              <p className="text-sm text-gray-700 mb-2">
                {selectedApplicant.title || selectedApplicant.type}{" "}
                {selectedApplicant.organizationName
                  ? `at ${selectedApplicant.organizationName}`
                  : ""}
              </p>

              {/* Tags */}
              <div className="text-blue-600 text-sm font-medium flex flex-wrap justify-start gap-x-2 gap-y-1 mb-4">
                {selectedApplicant.tags?.map((tag, idx) => (
                  <span key={idx} className="cursor-pointer hover:underline">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Navigation and Action Buttons - Single Row Layout */}
            <div className="flex items-center justify-between mb-6">
              {/* Navigation Tabs */}
              <div className="flex gap-2">
                <button
                  className={`border border-gray-300 px-4 py-2 rounded-full text-sm transition ${
                    activeSection === "profile"
                      ? "text-gray-900"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => onSectionChange("profile")}
                >
                  Profile
                </button>

                <button
                  className={`border border-gray-300 px-4 py-2 rounded-full text-sm transition ${
                    activeSection === "contact"
                      ? "text-gray-900"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => onSectionChange("contact")}
                >
                  Contacts
                </button>

                <button
                  className={`border border-gray-300 px-4 py-2 rounded-full text-sm transition ${
                    activeSection === "applicantDetails"
                      ? "text-gray-900"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => onSectionChange("applicantDetails")}
                >
                  Applicant Details
                </button>
              </div>

              {/* Action Buttons - Right Side */}
              <div className="flex gap-3">
                {selectedApplicant.status === "SHORTLISTING" ? (
                  // Show different buttons based on payment status
                  selectedApplicant.bookingStatus === "SUCCESS" ? (
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
                        onClick={() => onSendReminder()}
                        disabled={isRemindButtonDisabled(selectedApplicant)}
                        className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                          isRemindButtonDisabled(selectedApplicant)
                            ? "bg-gray-100 text-gray-500 border border-gray-300 cursor-not-allowed"
                            : "bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200"
                        }`}
                      >
                        {isRemindButtonDisabled(selectedApplicant)
                          ? `Remind (${getRemainingCooldownTime(selectedApplicant)})`
                          : "Remind"}
                      </button>
                    </>
                  )
                ) : (
                  // Show Reject and Approve buttons for other statuses
                  <>
                    <button
                      onClick={() =>
                        onRejectApplicant(selectedApplicant.id.toString())
                      }
                      disabled={selectedApplicant.status === "REJECTED"}
                      className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedApplicant.status === "REJECTED"
                          ? "bg-red-50 text-red-600 border border-red-200 cursor-not-allowed"
                          : "bg-white text-black border border-purple-300 hover:bg-purple-50 hover:border-purple-400"
                      }`}
                    >
                      {selectedApplicant.status === "REJECTED"
                        ? "Rejected"
                        : "Reject"}
                    </button>

                    <button
                      onClick={() =>
                        onHoldApplicant(selectedApplicant.id.toString())
                      }
                      disabled={selectedApplicant.status === "HOLD"}
                      className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedApplicant.status === "HOLD"
                          ? "bg-orange-50 text-orange-600 border border-orange-200 cursor-not-allowed"
                          : "bg-white text-black border border-orange-300 hover:bg-orange-50 hover:border-orange-400"
                      }`}
                    >
                      {selectedApplicant.status === "HOLD" ? "On Hold" : "Hold"}
                    </button>

                    <button
                      onClick={() =>
                        onApproveApplicant(selectedApplicant.id.toString())
                      }
                      disabled={
                        selectedApplicant.status === "REJECTED" ||
                        selectedApplicant.status === "FINAL" ||
                        selectedApplicant.status === "HOLD"
                      }
                      className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedApplicant.status === "REJECTED" ||
                        selectedApplicant.status === "FINAL" ||
                        selectedApplicant.status === "HOLD"
                          ? "bg-gray-50 text-gray-600 border border-gray-200 cursor-not-allowed"
                          : "bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 hover:border-blue-700"
                      }`}
                    >
                      {selectedApplicant.status === "FINAL"
                        ? "Approved"
                        : "Approve"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Second Detail Box (Dynamic) */}
          {activeSection !== "none" && (
            <div className="bg-white rounded-2xl shadow-xs px-6 py-6 mt-6 max-w-3xl mx-auto">
              {activeSection === "profile" && (
                <>
                  {/* Profile Information */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Profile Information
                    </h3>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-700">
                        Email: {selectedApplicant.email || "No email provided"}
                      </p>
                      <p className="text-sm text-gray-700">
                        Profession: {selectedApplicant.title || "Not specified"}
                      </p>
                      <p className="text-sm text-gray-700">
                        Organization:{" "}
                        {selectedApplicant.organizationName || "Not specified"}
                      </p>
                      <p className="text-sm text-gray-700">
                        Type: {selectedApplicant.type}
                      </p>
                    </div>
                  </div>

                  {/* Registration Details */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Registration Details
                    </h3>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-700">
                        Registration Date: {selectedApplicant.appliedDate}
                      </p>
                      <p className="text-sm text-gray-700">
                        Status: {selectedApplicant.status}
                      </p>
                    </div>
                  </div>

                  {/* Skills/Tags */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Skills & Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplicant.tags &&
                      selectedApplicant.tags.length > 0 ? (
                        selectedApplicant.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          No skills or tags specified
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {activeSection === "contact" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Contact Details
                  </h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700">
                      Email: {selectedApplicant.email || "No email provided"}
                    </p>
                    <p className="text-sm text-gray-700">
                      Phone: {selectedApplicant.phoneNo || "No phone provided"}
                    </p>
                    <p className="text-sm text-gray-700">
                      State: {selectedApplicant.state || "Not specified"}
                    </p>
                    <p className="text-sm text-gray-700">
                      Country: {selectedApplicant.country || "Not specified"}
                    </p>
                  </div>
                </div>
              )}

              {activeSection === "applicantDetails" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Applicant Details</h3>
                    <div className="flex items-center gap-2">
                      {questionnaireData && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          Last updated:{" "}
                          {new Date(
                            questionnaireData.lastUpdated || Date.now()
                          ).toLocaleTimeString()}
                        </span>
                      )}
                      <button
                        onClick={() =>
                          selectedApplicant &&
                          onApplicantSelection(selectedApplicant)
                        }
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Refresh data"
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
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {questionnaireData ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            value={questionnaireData.firstName || ""}
                            readOnly
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter first name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={questionnaireData.lastName || ""}
                            readOnly
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter last name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gender
                          </label>
                          <select
                            value={
                              questionnaireData.gender || "Prefer not to say"
                            }
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">
                              Prefer not to say
                            </option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Marital Status
                          </label>
                          <select
                            value={
                              questionnaireData.maritalStatus === true
                                ? "Married"
                                : questionnaireData.maritalStatus === false
                                  ? "Single"
                                  : "Prefer not to say"
                            }
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                            <option value="Prefer not to say">
                              Prefer not to say
                            </option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Associated Institute/Company Name
                          </label>
                          <input
                            type="text"
                            value={questionnaireData.organizationName || ""}
                            readOnly
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter institute or company name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Institute/Company ID Number
                          </label>
                          <input
                            type="text"
                            value={questionnaireData.zipCode || ""}
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500 mb-2">
                        No applicant details available
                      </p>
                      <p className="text-sm text-gray-400">
                        The applicant hasn&apos;t filled out their details yet.
                      </p>
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
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Select an applicant
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Choose an applicant from the list to view their detailed profile,
            contact information, and registration details.
          </p>
        </div>
      )}
    </div>
  );
}
