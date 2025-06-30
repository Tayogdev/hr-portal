'use client';
import React from 'react';

export default function ApplicantsTableHeader() {
  return (
    <div className="grid grid-cols-7 gap-4 py-2 px-3 bg-gray-100 font-medium text-gray-700 rounded-md text-sm">
      <div>Job Role</div>
      <div>Role</div>
      <div>Job Type</div>
      <div>Uploads</div>
      <div>Applied on</div>
      <div>Status Marked</div>
      <div>Actions</div>
    </div>
  );
}
