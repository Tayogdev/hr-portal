// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import SessionWrapper from '@/components/SessionWrapper';
import QueryProvider from '@/components/QueryProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

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
      <body className={`bg-white text-gray-900 antialiased ${poppins.className}`}>
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
