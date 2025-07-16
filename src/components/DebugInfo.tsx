'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function DebugInfo() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const pageId = searchParams.get('pageId');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchDebugData = async () => {
    if (!pageId) return;
    
    setLoading(true);
    try {
      // Check opportunities directly
      const response = await fetch(`/api/opportunities?pageId=${pageId}&page=1&limit=5`);
      const data = await response.json();
      setDebugData(data);
    } catch {
      // Silent error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pageId) {
      fetchDebugData();
    }
  }, [pageId]);

  if (!pageId) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md z-50">
      <h3 className="font-semibold text-sm mb-2">Debug Info</h3>
      <div className="text-xs space-y-1">
        <div><strong>Page ID:</strong> {pageId}</div>
        <div><strong>User ID:</strong> {session?.user?.id || 'Not available'}</div>
        <div><strong>User Email:</strong> {session?.user?.email || 'Not available'}</div>
        
        {loading && <div className="text-blue-600">Loading debug data...</div>}
        
        {debugData && (
          <div className="mt-2">
            <div><strong>API Response:</strong> {debugData.success ? 'Success' : 'Failed'}</div>
            <div><strong>Opportunities Found:</strong> {debugData.data?.opportunities?.length || 0}</div>
            <div><strong>Total Count:</strong> {debugData.data?.pagination?.total || 0}</div>
            <div><strong>Message:</strong> {debugData.message || 'N/A'}</div>
          </div>
        )}
        
        <button 
          onClick={fetchDebugData}
          className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          Refresh Debug Data
        </button>
      </div>
    </div>
  );
} 