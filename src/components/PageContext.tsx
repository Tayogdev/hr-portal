'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PageContextType {
  selectedPageId: string | null;
  setSelectedPageId: (pageId: string | null) => void;
  clearSelectedPage: () => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export function usePageContext() {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error('usePageContext must be used within a PageProvider');
  }
  return context;
}

interface PageProviderProps {
  children: ReactNode;
}

export function PageProvider({ children }: PageProviderProps) {
  const [selectedPageId, setSelectedPageIdState] = useState<string | null>(null);

  // Load persisted selectedPageId from localStorage on mount
  useEffect(() => {
    const storedSelectedPageId = localStorage.getItem('selectedPageId');
    
    if (storedSelectedPageId) {
      setSelectedPageIdState(storedSelectedPageId);
    }
  }, []);

  const setSelectedPageId = (pageId: string | null) => {
    setSelectedPageIdState(pageId);
    if (pageId) {
      localStorage.setItem('selectedPageId', pageId);
    } else {
      localStorage.removeItem('selectedPageId');
    }
  };

  const clearSelectedPage = () => {
    setSelectedPageIdState(null);
    localStorage.removeItem('selectedPageId');
  };

  const value: PageContextType = {
    selectedPageId,
    setSelectedPageId,
    clearSelectedPage,
  };

  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  );
} 