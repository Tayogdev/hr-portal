import React from 'react';
import { Loader2 } from 'lucide-react';

interface PageLoadingSkeletonProps {
  pageType: 'job-listing' | 'events' | 'all-applicants' | 'dashboard';
  currentPageName?: string | null;
  userEmail?: string;
}

export function PageLoadingSkeleton({ pageType, currentPageName, userEmail }: PageLoadingSkeletonProps) {
  const getPageTitle = () => {
    switch (pageType) {
      case 'job-listing': return 'Job Listing';
      case 'events': return 'Events';
      case 'all-applicants': return 'All Applicants';
      case 'dashboard': return 'Dashboard';
      default: return 'Loading';
    }
  };

  const getLoadingMessage = () => {
    switch (pageType) {
      case 'job-listing': return 'Loading job opportunities...';
      case 'events': return 'Loading events...';
      case 'all-applicants': return 'Loading applicants...';
      case 'dashboard': return 'Loading dashboard...';
      default: return 'Loading...';
    }
  };

  const renderTableSkeleton = () => {
    const rows = pageType === 'all-applicants' ? 8 : 6;
    const cols = pageType === 'job-listing' ? 8 : pageType === 'events' ? 6 : 7;
    
    return (
      <div className="w-full overflow-x-auto rounded-xl shadow bg-white">
        <div className="min-w-[800px] w-full">
          {/* Table Header Skeleton */}
          <div className="bg-gray-100 px-6 py-4">
            <div className={`grid grid-cols-${cols} gap-4`}>
              {Array.from({ length: cols }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          
          {/* Table Rows Skeleton */}
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="border-b px-6 py-4">
              <div className={`grid grid-cols-${cols} gap-4 items-center`}>
                {Array.from({ length: cols }).map((_, colIndex) => (
                  <div key={colIndex} className="flex items-center gap-2">
                    {colIndex === 0 && pageType === 'all-applicants' && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                    )}
                    {colIndex === 0 && pageType === 'job-listing' && (
                      <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
                    )}
                    <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCardSkeleton = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse mt-4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-[#F8F9FC] min-h-screen">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl md:text-2xl font-semibold">
              {getPageTitle()}
              {currentPageName && (
                <span className="text-lg text-blue-600 ml-2">- {currentPageName}</span>
              )}
            </h1>
          </div>
          
          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
            {userEmail && (
              <p className="text-sm text-blue-600">Showing data for: {userEmail}</p>
            )}
          </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="flex gap-2">
          <div className="w-24 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-32 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="mb-6">
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <div className="flex-1">
            <div className="text-blue-700 font-medium">{getLoadingMessage()}</div>
            <div className="text-blue-600 text-sm mt-1">Please wait while we fetch your data...</div>
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>

      {/* Filter buttons skeleton */}
      {(pageType === 'all-applicants' || pageType === 'events') && (
        <div className="flex flex-wrap gap-3 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded-full animate-pulse w-20"></div>
          ))}
        </div>
      )}

      {/* Content skeleton */}
      {pageType === 'dashboard' ? renderCardSkeleton() : renderTableSkeleton()}

      {/* Pagination skeleton */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <div className="w-20 h-9 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
        <div className="w-16 h-9 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}
