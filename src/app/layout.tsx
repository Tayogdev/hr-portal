// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import SessionWrapper from '@/components/SessionWrapper';

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
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}

