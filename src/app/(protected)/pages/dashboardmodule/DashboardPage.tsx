'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

type Page = {
  id: string;
  title: string;
  uName: string;
  logo?: string;
  type: string;
};

export default function DashboardPage(): React.JSX.Element {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await fetch('/api/pages');
        const data = await res.json();
        if (data.success) {
          setPages(data.pages);
        }
      } catch (error) {
        console.error('Error fetching pages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Dashboard</h1>

      {loading ? (
        <p className="text-gray-500">Loading pages...</p>
      ) : pages.length === 0 ? (
        <p className="text-gray-500">No pages found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page) => (
            <div key={page.id} className="bg-white p-4 shadow rounded-xl">
              <h2 className="text-lg font-semibold mb-1">{page.title}</h2>
              <p className="text-sm text-gray-500 mb-1">Type: {page.type}</p>
              <p className="text-sm text-gray-400 truncate">URL: /{page.uName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
