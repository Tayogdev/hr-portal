'use client';

import React, { useState, useEffect } from 'react';
import NewHeader from './NewHeader';
import NewSidebar from './NewSidebar';
import { ViewAs } from '@/types/auth-interface';

interface LayoutProps {
  children: React.ReactNode;
  currentView?: ViewAs;
}

export default function Layout({ children, currentView }: LayoutProps): React.JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start with false to match server
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setSidebarOpen(true); // Set to true after client hydration
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header - Full Width */}
      <NewHeader 
        currentView={currentView} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      {/* Sidebar */}
      <NewSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main Content - Responsive layout */}
      <main 
        className={`
          bg-white min-h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out overflow-y-auto pt-16
          ${sidebarOpen ? 'lg:ml-64 lg:w-[calc(100%-16rem)]' : 'lg:ml-0 w-full'}
        `}
      >
        <div className="px-6 py-6">
          {children}
        </div>  
      </main>
    </div> 
  );
}
