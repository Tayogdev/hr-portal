'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export default function SessionWrapper({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      // Enable automatic session refresh
      refetchInterval={5 * 60} // 5 minutes
      refetchOnWindowFocus={true}
      // Refresh token when it's about to expire
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  );
} 