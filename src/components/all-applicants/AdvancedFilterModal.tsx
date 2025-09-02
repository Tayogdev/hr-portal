    'use client';

import React, { useState } from 'react';

interface AdvancedFilterModalProps {
  onClose: () => void;
  onApplyFilters: (filters: {
    minScore: number;
    maxScore: number;
    jobType: string;
  }) => void;
}

const AdvancedFilterModal: React.FC<AdvancedFilterModalProps> = ({ onClose, onApplyFilters }) => {
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(10);
  const [jobType, setJobType] = useState('');


  const handleApply = () => {
    onApplyFilters({ minScore, maxScore, jobType });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-md p-6 w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Advanced Filters</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-red-500">
            ✖
          </button>
        </div>

        <div className="space-y-4">
          {/* Score Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Score Range</label>
            <div className="flex gap-3">
              <input
                type="number"
                className="border rounded px-3 py-1 w-full"
                placeholder="Min"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
              />
              <input
                type="number"
                className="border rounded px-3 py-1 w-full"
                placeholder="Max"
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
            <select
              className="border rounded px-3 py-1 w-full"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
            >
              <option value="">Any</option>
              <option value="Internship">Internship</option>
              <option value="Full Time">Full Time</option>
            </select>
          </div>

          {/* Apply Button */}
          <div className="text-right">
            <button
              onClick={handleApply}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilterModal;
