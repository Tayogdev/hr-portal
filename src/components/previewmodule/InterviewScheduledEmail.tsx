import React from "react";

const InterviewScheduledEmailPreview = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full bg-white rounded-xl overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-indigo-500 text-white text-center py-10 rounded-t-xl">
          <h2 className="text-xl font-semibold">Interview Scheduled</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-8 text-gray-800 text-[15px] leading-relaxed">
          <p className="mb-4 text-center font-medium">
            Dear <strong>[Applicant name]</strong>,
          </p>

          <p className="mb-4 text-center">
            Great news! Your interview for the role of{" "}
            <strong>[Job Title]</strong> at <strong>[Company Name]</strong> is now scheduled.
          </p>

          {/* Interview Details Card */}
               {/* Interview Details Card - STRUCTURE MODIFIED TO MATCH NEW IMAGE */}
          <div className="bg-white rounded-xl mb-8 shadow-lg overflow-hidden border border-gray-200"> {/* Main card wrapper, white background */}
            {/* Interview Details Title Bar */}
            <div className="bg-indigo-500 text-white text-center py-4 rounded-t-xl"> {/* Specific header for the card */}
              <h3 className="text-xl font-semibold">Interview details</h3>
            </div>

            {/* Interview Details Content */}
            <div className="p-6 text-gray-800 text-center"> {/* Content inside the card */}
              <p className="mb-2">
                <span className="font-medium">Date:</span> August 13, 2025
              </p>
              <p className="mb-2">
                <span className="font-medium">Time:</span> 9:00 AM
              </p>
              <p className="mb-2">
                <span className="font-medium">Mode:</span> Google Meet
              </p>
              <p>
                <span className="font-medium">Link to Join:</span>{" "}
                <a
                  href="[Insert Meeting Link]"
                  className="text-blue-600 hover:underline" // Changed link color for better contrast on white background
                >
                  [Insert Meeting Link]
                </a>
              </p>
            </div>
          </div>



          <p className="mb-4 text-justify">
            If you have any questions or need to reschedule, feel free to reach out.
We&apos;re excited to learn more about your journey and ideas!
          </p>

          <p className="mb-6 text-center">
            Wishing you the best. See you soon!
          </p>

          <p className="text-sm text-gray-500 mb-2 text-justify">
            We are committed to helping you achieve your academic and research goals.
            If you have any questions or need assistance, our{" "}
            <span className="text-blue-600 underline">support team</span> is just an email away at
            <br />
            <span className="italic text-gray-700">support@tayog.in</span>
          </p>

          <p className="mt-6">Thanks,</p>
          <p className="mb-1 font-medium">Team Tayog</p>
          <p className="text-sm text-gray-700">hello@tayog.in</p>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 text-xs text-center text-gray-500 py-4 rounded-b-xl">
          Copyrights © all rights reserved by Tayog
        </div>
      </div>
    </div>
  );
};

export default InterviewScheduledEmailPreview;
