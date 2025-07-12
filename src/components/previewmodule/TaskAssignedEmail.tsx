import React from "react";
import Image from "next/image";
const TaskAssignEmailPreview = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full bg-white rounded-xl overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-indigo-500 text-white text-center py-10 rounded-t-xl">
          <h2 className="text-xl font-semibold">Task Assigned</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-8 text-gray-800 text-[15px] leading-relaxed">
          <p className="mb-4 text-center font-medium">
            Dear <strong>[Applicant name]</strong>,
          </p>

          <p className="mb-6 text-center">
            Thank you for applying for the <strong>[Job Title]</strong> position at{" "}
            <strong>[Company Name]</strong>.
          </p>

          {/* Job Info Card */}
          <div className="bg-white rounded-lg shadow p-4 mb-6 border border-gray-200 flex justify-between items-start gap-4">
            <div className="flex-1">
              <p className="text-xs text-indigo-600 font-medium mb-1">Verified by IIT Hyderabad</p>
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
  src="https://i.ibb.co/3s65Rz9/Screenshot-2024-07-10-at-10-48-26-PM.png"
  alt="IIT Logo"
  width={64}
  height={64}
  className="object-contain"
/>
          </div>

          {/* Task Message */}
          <p className="mb-4 text-justify">
            As part of our evaluation process, we would like you to complete a short task to help us better understand your skills and approach.
          </p>

          <div className="mb-6">
            <p className="font-semibold text-gray-800 text-base mb-2">Task Details:</p>
            <ul className="list-none space-y-2 text-gray-700">
              <li className="relative pl-5">
                <span className="absolute left-0 top-1.5 w-2 h-2 bg-gray-500 rounded-full"></span>
<span className="font-medium">Brief description of the task</span> – e.g., &quot;Design a landing page for a fictional product&quot; or &quot;Write a 500-word article on a given topic.&quot;
              </li>
              <li className="relative pl-5">
                <span className="absolute left-0 top-1.5 w-2 h-2 bg-gray-500 rounded-full"></span>
                <span className="font-medium">Deadline:</span> [Mention date and time]
              </li>
              <li className="relative pl-5">
                <span className="absolute left-0 top-1.5 w-2 h-2 bg-gray-500 rounded-full"></span>
                <span className="font-medium">Submission Format:</span> [e.g., PDF, link, document]
              </li>
              <li className="relative pl-5">
                <span className="absolute left-0 top-1.5 w-2 h-2 bg-gray-500 rounded-full"></span>
                <span className="font-medium">Submit To:</span> [Email or upload portal]
              </li>
            </ul>
          </div>

          <p className="mb-4 text-justify">
            Please go through the task brief carefully and feel free to reach out to us at{" "}
            <a href="mailto:[contact email]" className="text-blue-600 underline">[contact email]</a>{" "}
            if you have any questions or need clarification.
          </p>

          <p className="mb-6 text-center">
            We look forward to reviewing your submission.
          </p>

          <p className="text-sm text-gray-500 mb-2 text-justify">
            We are committed to helping you achieve your academic and research goals. 
            If you have any questions or need assistance, our{" "}
            <span className="font-medium">support team</span> is just an email away at{" "}
            <a href="mailto:support@tayog.in" className="text-blue-600 underline">support@tayog.in</a>
          </p>

          <p className="mt-6">Thanks,</p>
          <p className="mb-1 font-medium">Team Tayog</p>
          <p className="text-sm text-gray-700">
            <a href="mailto:hello@tayog.in" className="text-blue-600 hover:underline">hello@tayog.in</a>
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 text-xs text-center text-gray-500 py-4 rounded-b-xl">
          Copyrights © all rights reserved by Tayog
        </div>
      </div>
    </div>
  );
};

export default TaskAssignEmailPreview;
