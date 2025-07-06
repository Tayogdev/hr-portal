// components/AssignTaskModal.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

// Define the type for task details
type TaskDetails = {
  title: string;
  description: string;
  dueDate: string;
  tags: string[];
  uploadedFileName: string | null;
  // Potentially add IDs or other metadata if your backend includes them
  // For 'Created On' and 'Updated On', we'll manage them within the component's state,
  // but if they come from the backend, they should be part of TaskDetails
};

// Extend TaskDetails to include optional timestamps if they are part of initial data
type InitialTaskDetails = TaskDetails & {
  createdOn?: string; // ISO string or other format from backend
  updatedOn?: string; // ISO string or other format from backend
};

// Define props for the AssignTaskModal component
type AssignTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedApplicantName?: string; // Optional prop for the applicant's name
  onAssignTask: (taskDetails: TaskDetails) => void;
  initialTaskData?: InitialTaskDetails | null; // New prop for pre-populating the form
};

export const AssignTaskModal: React.FC<AssignTaskModalProps> = ({
  isOpen,
  onClose,
  selectedApplicantName,
  onAssignTask,
  initialTaskData, // Destructure the new prop
}) => {
  // All HOOKS MUST BE DECLARED HERE, UNCONDITIONALLY, AT THE TOP LEVEL
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const [createdOn, setCreatedOn] = useState<string>('');
  const [updatedOn, setUpdatedOn] = useState<string>('');

  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);

  // useEffect to handle modal opening and initial data loading
  // This effect needs to be declared unconditionally, like all other hooks.
  useEffect(() => {
    if (isOpen) { // Only run logic if modal is actually open
      setShowSuccessMessage(false); // Ensure success message is hidden on open

      // Populate form fields if initialTaskData is provided
      if (initialTaskData) {
        setTaskTitle(initialTaskData.title || '');
        setDescription(initialTaskData.description || '');
        setDueDate(formatISODateToDatetimeLocal(initialTaskData.dueDate)); // Format for datetime-local input
        setTags(initialTaskData.tags ? initialTaskData.tags.join(', ') : ''); // Join tags for display
        setUploadedFileName(initialTaskData.uploadedFileName || null);

        // Use initialTaskData's timestamps if available, otherwise set current time
        setCreatedOn(initialTaskData.createdOn ? formatDateTime(new Date(initialTaskData.createdOn)) : formatDateTime(new Date()));
        setUpdatedOn(initialTaskData.updatedOn ? formatDateTime(new Date(initialTaskData.updatedOn)) : formatDateTime(new Date()));
      } else {
        // If no initial data, reset fields and set current time for new task
        setTaskTitle('');
        setDescription('');
        setDueDate('');
        setTags('');
        setUploadedFileName(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        const now = new Date();
        const formattedNow = formatDateTime(now);
        setCreatedOn(formattedNow);
        setUpdatedOn(formattedNow);
      }
    }
  }, [isOpen, initialTaskData]); // Depend on isOpen and initialTaskData


  // If the modal is not open, don't render anything to optimize performance.
  // This check comes AFTER all hook declarations.
  if (!isOpen) return null;

  // Function to format date and time for display
  const formatDateTime = (date: Date): string => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).replace(' at ', ', '); // Custom replacement for "at"
  };

  // Helper to format ISO date string to datetime-local format
  // This is crucial for the <input type="datetime-local"> field
  const formatISODateToDatetimeLocal = (isoString?: string | null): string => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      // Ensure date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date string provided:", isoString);
        return '';
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting ISO date to datetime-local:", error);
      return '';
    }
  };

  // Handler for file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
    } else {
      setUploadedFileName(null);
    }
  };

  // Triggers the hidden file input click programmatically
  const triggerFileUpload = (): void => {
    fileInputRef.current?.click();
  };

  // Handler for form submission
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault(); // Prevent default form submission behavior

    // Basic validation: Check if required fields are filled
    if (!taskTitle.trim() || !description.trim() || !dueDate.trim()) {
      alert("Please fill in Task Title, Description, and Due Date.");
      return;
    }

    // Prepare task details object
    const taskDetails: TaskDetails = {
      title: taskTitle.trim(), // Trim whitespace from title
      description: description.trim(), // Trim whitespace from description
      dueDate: dueDate, // dueDate is already in the correct format for the input, might need conversion for backend
      // Split tags by comma, trim each tag, and filter out any empty strings
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      uploadedFileName: uploadedFileName,
    };

    // Call the `onAssignTask` prop from the parent component with the task details
    onAssignTask(taskDetails);

    // Show success message within the modal
    setShowSuccessMessage(true);

    // Automatically hide success message and close the modal after a delay
    setTimeout(() => {
      setShowSuccessMessage(false); // Hide success message
      onClose(); // Close the main modal, which allows the parent to update its UI
    }, 2000); // Display success message for 2 seconds
  };

  return (
    <>
      {/* Main modal overlay and content container */}
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
        {/* Modal Content Container */}
        <div
          className="bg-white rounded-lg p-6 w-full max-w-sm sm:max-w-md md:max-w-xl lg:max-w-3xl xl:max-w-5xl
                      max-h-[90vh] mx-auto relative flex flex-col shadow-lg overflow-hidden"
        >
          {/* Close Button - positioned absolutely and remains visible */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl font-light z-10"
            aria-label="Close" // Accessibility improvement
          >
            &times; {/* HTML entity for a multiplication sign (X) */}
          </button>

          {/* Conditional rendering: Show success message or the task assignment form */}
          {showSuccessMessage ? (
            // Success Message View
            <div className="flex flex-col items-center justify-center h-full py-20 animate-fade-in">
              <svg
                className="w-16 h-16 text-green-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true" // Indicate to screen readers that this is decorative
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Task Assigned Successfully!</h2>
              <p className="text-gray-600 text-center">
                The task &quot;<span className="font-medium">{taskTitle}</span>&quot; has been successfully assigned to{' '}
                <span className="font-medium">{selectedApplicantName || 'the applicant'}</span>.
                <br />The modal will close shortly.
              </p>
            </div>
          ) : (
            // Task Assignment Form View
            <>
              <h2 className="text-xl font-semibold mb-6 text-gray-900">{initialTaskData ? "Edit Task" : "Attach Document"}</h2>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-y-auto pr-2">
                {/* Left Column: Upload Document and Manual Details */}
                <div className="p-4 rounded-lg shadow-md border border-gray-200">
                  <div className="mb-4">
                    <label htmlFor="upload-doc" className="block text-sm font-medium text-gray-700 mb-2">Upload Document</label>
                    {/* Custom styled file input area */}
                    <div
                      className="border border-dashed border-gray-300 rounded-md py-2 px-3 text-gray-500 cursor-pointer flex items-center justify-between hover:border-gray-400 transition-colors"
                      onClick={triggerFileUpload}
                      role="button" // Indicate that this div is clickable
                      tabIndex={0} // Make it focusable
                      onKeyDown={(e) => { // Allow keyboard interaction for accessibility
                        if (e.key === 'Enter' || e.key === ' ') {
                          triggerFileUpload();
                        }
                      }}
                    >
                      <span className="truncate">{uploadedFileName || 'Upload Document'}</span>
                      {/* Upload icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">DOC, DOCx, PDF, RTF | Max 2 MB</p>
                    <input
                      type="file"
                      className="hidden"
                      id="upload-doc"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".doc,.docx,.pdf,.rtf" // Specify accepted file types
                    />
                  </div>

                  <Button type="button" className="w-full mb-4 bg-orange-500 hover:bg-orange-600 text-white text-sm py-2">
                    Apply auto fill magic ✨
                  </Button>

                  <p className="text-center text-gray-500 text-xs mb-4">
                    It will automatically fill out the form based on the uploaded document above.
                  </p>

                  {/* "or" separator */}
                  <div className="relative flex items-center justify-center my-4">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-sm bg-white px-2">or</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                  </div>

                  <p className="block text-sm font-medium text-gray-700 mb-2">Fill the details manually</p>

                  <div className="mb-4">
                    <label htmlFor="task-title" className="block text-sm font-medium text-gray-700">Task Title<span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="task-title"
                      placeholder="Title..."
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                      aria-required="true" // Accessibility improvement
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description<span className="text-red-500">*</span></label>
                    <textarea
                      id="description"
                      placeholder="Description...."
                      rows={6}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-y" // Allow vertical resizing
                      required
                      aria-required="true" // Accessibility improvement
                    ></textarea>
                  </div>
                </div>

                {/* Right Column: Created By, Assignee(s), Due Date, Tags, Created on, Updated on */}
                <div className="p-4 rounded-lg bg-blue-50/50 shadow-inner">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Created By</p>
                    <div className="flex items-center mt-1">
                      {/* It's good practice to provide `alt` text that describes the image content */}
                      <Image src="/avatar-placeholder.png" alt="Vidushi Bhardwaj&apos;s avatar" width={32} height={32} className="rounded-full mr-2 object-cover" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Vidushi Bhardwaj</p>
                        <p className="text-xs text-gray-500">Interaction Designer</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Assignee(s)<span className="text-red-500">*</span></label>
                    <div className="flex items-center mt-1">
                      {/* Assignee Avatars (consider making these dynamic if applicable) */}
                      <Image src="/avatar-placeholder.png" alt="Assignee avatar" width={32} height={32} className="rounded-full mr-1 object-cover" />
                      <Image src="/avatar-placeholder.png" alt="Assignee avatar" width={32} height={32} className="rounded-full mr-1 object-cover" />
                      <Image src="/avatar-placeholder.png" alt="Assignee avatar" width={32} height={32} className="rounded-full mr-1 object-cover" />
                      <button
                        type="button"
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-600 text-xl hover:bg-gray-300 transition-colors"
                        aria-label="Add assignee" // Accessibility improvement
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="due-date" className="block text-sm font-medium text-gray-700">Due Date<span className="text-red-500">*</span></label>
                    <input
                      type="datetime-local"
                      id="due-date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                      aria-required="true" // Accessibility improvement
                    />
                  </div>

                  {/* Tags Section */}
                  <div className="mt-4">
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
                    <input
                      type="text"
                      id="tags"
                      placeholder="e.g., Design Task, Hiring Stage 2"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      aria-describedby="tags-hint" // Associate hint with input for accessibility
                    />
                    <p id="tags-hint" className="mt-1 text-xs text-gray-500">Separate tags with commas (e.g., Tag1, Tag2)</p>
                  </div>

                  {/* Created on - dynamically populated and read-only */}
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">Created on</p>
                    <p className="mt-1 text-sm text-gray-900">{createdOn}</p>
                  </div>

                  {/* Updated on - dynamically populated and read-only */}
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">Updated on</p>
                    <p className="mt-1 text-sm text-gray-900">{updatedOn}</p>
                  </div>

                  {/* Assign Task Button */}
                  <Button type="submit" className="w-full bg-[#6366F1] text-white py-2 rounded-md hover:bg-indigo-700 mt-6">
                    {initialTaskData ? "Update Task" : "Assign Task"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};