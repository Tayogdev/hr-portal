'use client';
import React from 'react';

interface Props {
  selected: string;
  onSelect: (filter: string) => void;
}

const filters = ['All', 'Shortlisted', 'New', 'Declined', 'May fit'];

export default function FilterButtons({ selected, onSelect }: Props) {
  return (
    <>
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onSelect(filter)}
          className={`px-4 py-1.5 rounded-full border text-sm font-medium ${
            selected === filter
              ? 'bg-[#4F8FF0] text-white border-[#4F8FF0]'
              : 'text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          {filter}
        </button>
      ))}
    </>
  );
}
