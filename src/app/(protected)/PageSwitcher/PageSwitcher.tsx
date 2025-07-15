'use client';
import React, { useEffect, useState } from 'react';

type Page = {
  id: string;
  title: string;
  uName: string;
  logo?: string;
  type?: string;
};

export default function PageSwitcher() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await fetch('/api/pages');
        const data = await res.json();
        if (data.success) {
          setPages(data.pages);
        } else {
          setError(data.message || 'Failed to load pages');
        }
      } catch (err) {
        console.error(err);
        setError('Error loading pages');
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  const handleSwitch = (page: Page) => {
    console.log('Switching to page:', page);
    // In future: update session.view or navigate to page
  };

  if (loading) {
    return <div className="px-4 py-2 text-sm text-gray-500">Loading pages...</div>;
  }

  if (error) {
    return <div className="px-4 py-2 text-sm text-red-500">{error}</div>;
  }

  return (
    <div className="px-4 py-2">
      <h3 className="text-sm font-semibold mb-2 text-gray-600">Your Pages</h3>
      {pages.length === 0 ? (
        <div className="text-sm text-gray-500">No pages found.</div>
      ) : (
        <ul className="space-y-1">
          {pages.map((page) => (
            <li key={page.id}>
              <button
                onClick={() => handleSwitch(page)}
                className="w-full text-left text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-md transition"
              >
                {page.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
