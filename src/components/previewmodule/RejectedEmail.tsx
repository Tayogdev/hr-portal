import React from "react";

const RejectedEmail = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full bg-white rounded-xl overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-indigo-500 text-white text-center py-10 rounded-t-xl">
          <h2 className="text-xl font-semibold">Rejected Application</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-8 text-gray-800 text-[15px] leading-relaxed">
          <p className="mb-4 text-center font-medium">
            Dear <strong>[Applicant name]</strong>,
          </p>

          <p className="mb-6 text-center">
            Thank you for your interest in the <strong>[Job Title]</strong> position at{" "}
            <strong>[Company Name]</strong>.
          </p>

          <p className="mb-4 text-justify">
            After careful review of your application, we regret to inform you that you{" "}
            <strong>have not been selected</strong> for the next stage.
            Please know that this decision was not easy, as we received a large number of strong applications.
            We truly appreciate the time and effort you put into applying and your interest in being part of our team.
          </p>

          <p className="mb-4 text-justify">
            We encourage you to apply for future opportunities with us that match your skills and experience.
          </p>

          <p className="mb-4 text-center">
            Wishing you all the best in your job search and future endeavors.
          </p>

          <p className="text-sm text-gray-500 mb-2 text-justify">
            We are committed to helping you achieve your academic and research goals. 
            If you have any questions or need assistance, our{" "}
            <span className="text-blue-600 underline">support team</span> is just an email away at <br />
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

export default RejectedEmail;
