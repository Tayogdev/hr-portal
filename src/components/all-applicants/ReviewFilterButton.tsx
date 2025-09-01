'use client';

import React from 'react';

interface ReviewFilterButtonProps {
  onClick: () => void;
}

export default function ReviewFilterButton({ onClick }: ReviewFilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className="ml-auto px-4 py-1.5 flex items-center gap-2 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
    >
      <span>⚙</span> Review by filters
    </button>
  );
}
