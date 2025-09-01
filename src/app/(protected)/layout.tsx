import CustomNavbar from './sidebar/CustomNavbar';
import Header from '@/components/Header';
import { LoadingProvider } from '@/components/LoadingProvider';
import { PageProvider } from '@/components/PageContext';
import { getSessionAndViewAs } from '@/app/api/auth/getSession';

export default async function ProtectedGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { viewAs } = await getSessionAndViewAs();

  return (
    <LoadingProvider>
      <PageProvider>
        <div className="flex h-screen overflow-hidden bg-gray-50">
          {/* Fixed Sidebar */}
          <CustomNavbar />

          {/* Main content area with proper margin for fixed sidebar */}
          <div className="flex-1 flex flex-col ml-0 md:ml-64 overflow-hidden">
            {/* Fixed Header */}
            <Header currentView={viewAs} />
            
            {/* Scrollable main content */}
            <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </PageProvider>
    </LoadingProvider>
  );
}