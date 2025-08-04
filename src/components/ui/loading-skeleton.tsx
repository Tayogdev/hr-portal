import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
  height?: string;
  width?: string;
}

export function LoadingSkeleton({ 
  className = "", 
  count = 1, 
  height = "h-4", 
  width = "w-full" 
}: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${height} ${width} bg-gray-200 rounded animate-pulse ${className}`}
        />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <LoadingSkeleton height="h-6" width="w-32" />
        <LoadingSkeleton height="h-8" width="w-8" />
      </div>
      <LoadingSkeleton height="h-4" width="w-full" className="mb-2" />
      <LoadingSkeleton height="h-4" width="w-3/4" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <LoadingSkeleton height="h-6" width="w-32" />
          <LoadingSkeleton height="h-8" width="w-24" />
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LoadingSkeleton height="h-10" width="w-10" className="rounded-full" />
                <div className="space-y-2">
                  <LoadingSkeleton height="h-4" width="w-32" />
                  <LoadingSkeleton height="h-3" width="w-24" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LoadingSkeleton height="h-6" width="w-16" />
                <LoadingSkeleton height="h-8" width="w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <LoadingSkeleton height="h-8" width="w-64" className="mb-2" />
        <LoadingSkeleton height="h-5" width="w-96" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <LoadingSkeleton height="h-6" width="w-32" className="mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <LoadingSkeleton height="h-8" width="w-8" className="mb-3" />
              <LoadingSkeleton height="h-5" width="w-24" className="mb-2" />
              <LoadingSkeleton height="h-4" width="w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div>
        <LoadingSkeleton height="h-6" width="w-40" className="mb-4" />
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center gap-3">
                <LoadingSkeleton height="h-4" width="w-4" className="rounded-full" />
                <LoadingSkeleton height="h-4" width="w-48" />
              </div>
              <LoadingSkeleton height="h-4" width="w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 