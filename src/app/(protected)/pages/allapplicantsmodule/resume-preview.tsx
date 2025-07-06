'use client';

import React, { useState } from 'react';

export default function ResumePreview() {
  const [activeSection, setActiveSection] = useState<'none' | 'profile' | 'resume' | 'contact' | 'files' | 'shortlist'>('none');

  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-2xl p-6 flex flex-col gap-4 relative">

        {/* Name & Role */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gatikrushna Mohapatra</h2>
            <p className="text-sm text-gray-700 mt-1">
              UI/UX Designer, Pursuing Bachelors of Design from IIT Hyderabad
            </p>
          </div>
          <div className="text-gray-500 text-xl font-bold">⋯</div>  
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 text-sm text-indigo-600 font-medium">
          <span>UI Design</span>
          <span>Dashboard Design</span>
          <span>Web design</span>
          <span>User research</span>
          <span>UX design</span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-between items-center mt-2">
          {/* Left Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setActiveSection(activeSection === 'profile' ? 'none' : 'profile')}
              className="rounded-full border px-4 py-1 text-sm text-gray-700 border-gray-300 hover:bg-gray-100"
            >
              Profile
            </button>

            <button
              onClick={() => setActiveSection(activeSection === 'resume' ? 'none' : 'resume')}
              className="rounded-full border px-4 py-1 text-sm text-gray-700 border-gray-300 hover:bg-gray-100"
            >
              Resume/ CV
            </button>

            <button
              onClick={() => setActiveSection(activeSection === 'contact' ? 'none' : 'contact')}
              className="rounded-full border px-4 py-1 text-sm text-gray-700 border-gray-300 hover:bg-gray-100"
            >
              Contacts
            </button>

            {/* 2 Files Dropdown */}
            <button
              onClick={() => setActiveSection(activeSection === 'files' ? 'none' : 'files')}
              className="rounded-full border px-4 py-1 text-sm text-gray-700 border-gray-300 hover:bg-gray-100"
            >
              2 files ▼
            </button>
          </div>

          {/* Right Buttons */}
          <div className="flex gap-3 relative">
            {/* Shortlist Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveSection(activeSection === 'shortlist' ? 'none' : 'shortlist')}
                className="rounded-full border px-4 py-1 text-sm text-gray-700 border-indigo-500 hover:bg-indigo-50"
              >
                Shortlist ▼
              </button>
              {activeSection === 'shortlist' && (
                <div className="absolute top-full mt-1 right-0 bg-white shadow-md rounded-md w-48 z-10 border">
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Move to Interview
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Keep in Reserve
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100">
                    Reject
                  </button>
                </div>
              )}
            </div>

            <button
              className="bg-indigo-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-indigo-700 transition"
              onClick={() => alert('Candidate Finalized')}
            >
              Finalize
            </button>
          </div>
        </div>

        {/* Profile Info */}
        {activeSection === 'profile' && (
          <div className="mt-6">
            <h4 className="text-md font-semibold mb-2">Profile Summary</h4>
            <p className="text-gray-700 text-sm">
              Gatikrushna is a passionate UI/UX designer with strong experience in design systems, wireframing, user research, and web interface design. Currently pursuing a Bachelor&rsquo;s of Design at IIT Hyderabad, he blends creativity with usability to create intuitive and user-friendly digital experiences.
            </p>
          </div>
        )}

        {/* Resume PDF Viewer */}
        {activeSection === 'resume' && (
          <div className="mt-6 w-full h-[700px]">
            <iframe
              src="/resume-sample.pdf"
              className="w-full h-full rounded-md border"
              title="Resume PDF"
            />
          </div>
        )}

        {/* Files Viewer */}
        {activeSection === 'files' && (
          <div className="mt-6 bg-gray-50 border rounded-md p-4 space-y-2">
            <a href="/portfolio.pdf" target="_blank" className="block text-indigo-600 hover:underline">
              Portfolio.pdf
            </a>
            <a href="/case-study.pdf" target="_blank" className="block text-indigo-600 hover:underline">
              Case Study.pdf
            </a>
          </div>
        )}

        {/* Contact Info */}
        {activeSection === 'contact' && (
          <div id="contact-info" className="mt-10">
            <h4 className="text-md font-semibold mb-2">Contact Info</h4>
            <p>Email: bd21bdes11008@iith.ac.in</p>
            <p>Phone: +91 7205869973</p>
          </div>
        )}
      </div>
    </div>
  );
}
