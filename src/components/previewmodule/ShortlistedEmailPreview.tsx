import React from "react";
import Image from "next/image";

const ShortlistedEmailPreview = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full bg-white rounded-xl overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-indigo-500 text-white text-center py-10 rounded-t-xl">
          <h2 className="text-xl font-semibold">Shortlisted Application</h2>
        </div>

        {/* Body */}
       <div className="px-6 py-8 text-gray-800 text-[15px] leading-relaxed">
          <p className="mb-4 text-center">
            Dear <strong>[Applicant name]</strong>,
          </p>
          <p className="mb-6 text-center">
            Congratulations! We are delighted to offer you the position of{" "}
            <strong>[Job Title]</strong> at <strong>[Company Name]</strong>.
          </p>

          {/* Job Info Card */}
         <div className="bg-white rounded-lg shadow p-4 mb-6 border border-gray-200 flex justify-between items-start gap-4">
            <div className="flex-1">
              <p className="text-xs text-indigo-600 font-medium mb-1">
                Verified by IIT Hyderabad
              </p>
              <h3 className="text-sm font-semibold text-blue-700 leading-snug">
                Looking for High-Level Talents Indian Institute of Technology Hyderabad
              </h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-3">
                <span>📅 Summer Intern</span>
                <span>💰 Stipend: 15k–20k</span>
                <span>📍 Hyderabad, India</span>
                <span>🏛️ Department of Design, IIT Hyderabad</span>
              </div>
            </div>
           <Image
  src="/logo.png"
  alt="IIT Logo"
  width={64} // w-16 = 64px
  height={64} // h-16 = 64px
  className="object-contain"
/>
          </div>

          {/* Main Message */}
          <p className="mb-4">
            We are pleased to inform you that your application <strong>has been shortlisted</strong> for the next stage of our hiring process. 
            Our team was impressed with your qualifications, and we look forward to learning more about you. 
            You will be contacted shortly with the details of the next steps.
          </p>

          <p className="mb-4">
            If you have any questions in the meantime, feel free to reach out to us.
          </p>

          <p className="text-sm text-gray-500 mb-2">
            We are committed to helping you achieve your academic and research goals. 
            If you have any questions or need assistance, our <span className="text-blue-600 underline">support team</span> is just an email away at 
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

export default ShortlistedEmailPreview;
