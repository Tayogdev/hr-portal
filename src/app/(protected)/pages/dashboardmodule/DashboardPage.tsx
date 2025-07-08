'use client';

import React from 'react';

export default function DashboardPage(): React.JSX.Element {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Dashboard</h1>

      <p className="text-sm sm:text-base text-gray-600 mb-6">
        Welcome to the dashboard! This page is fully responsive and adapts to screen size.
      </p>

      {/* Example of responsive grid (can be used for stats/cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 shadow rounded-xl">
          <h2 className="text-lg font-semibold mb-2">Card 1</h2>
          <p className="text-sm text-gray-500">Card content here</p>
        </div>
        <div className="bg-white p-4 shadow rounded-xl">
          <h2 className="text-lg font-semibold mb-2">Card 2</h2>
          <p className="text-sm text-gray-500">Card content here</p>
        </div>
        <div className="bg-white p-4 shadow rounded-xl">
          <h2 className="text-lg font-semibold mb-2">Card 3</h2>
          <p className="text-sm text-gray-500">Card content here</p>
        </div>
      </div>
    </div>
  );
}
