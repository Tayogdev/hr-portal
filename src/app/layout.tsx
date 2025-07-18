// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import SessionWrapper from '@/components/SessionWrapper';
import QueryProvider from '@/components/QueryProvider';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'tayog',
  description: 'Job Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">  
      <body className="bg-white text-gray-900 antialiased">
        <ErrorBoundary>
          <QueryProvider>
            <SessionWrapper>
              {children}
            </SessionWrapper>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
