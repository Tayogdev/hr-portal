'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const startLoading = (message?: string) => {
    setIsLoading(true);
    if (message) setLoadingMessage(message);
  };
  
  const stopLoading = () => {
    setIsLoading(false);
    setLoadingMessage('Loading...');
  };

  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      setIsLoading, 
      startLoading, 
      stopLoading, 
      loadingMessage, 
      setLoadingMessage 
    }}>
      {children}
      
      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-700 font-medium">{loadingMessage}</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
} 