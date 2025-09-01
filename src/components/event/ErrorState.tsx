import React from "react";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ErrorState({
  error,
  onRetry,
}: ErrorStateProps): React.JSX.Element {
  return (
    <div className="p-8 bg-[#F8F9FC] min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button
          onClick={onRetry}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
