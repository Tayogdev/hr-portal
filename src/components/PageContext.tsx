'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { CustomSession } from '@/types/auth-interface';

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
  const { data: session, status } = useSession();
  const customSession = session as CustomSession;

  // Memoize the context value to prevent unnecessary re-renders
  const value: PageContextType = useMemo(() => {
    // Get selectedPageId from session view instead of localStorage
    const selectedPageId = customSession?.view?.id || null;

    const setSelectedPageId = (pageId: string | null) => {
      
    };

    const clearSelectedPage = () => {
      
    };

    return {
      selectedPageId,
      setSelectedPageId,
      clearSelectedPage,
    };
  }, [customSession?.view?.id]);

  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  );
}