import CustomNavbar from './sidebar/CustomNavbar';
import Header from './header/Header';
import ProtectedLayout from '../../components/ProtectedLayout';
import { LoadingProvider } from '../../components/LoadingProvider';

export default function ProtectedGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout>
      <LoadingProvider>
        <div className="flex h-screen overflow-hidden bg-gray-50">
          {/* Fixed Sidebar */}
          <CustomNavbar />

          {/* Main content area with proper margin for fixed sidebar */}
          <div className="flex-1 flex flex-col ml-0 md:ml-64 overflow-hidden">
            {/* Fixed Header */}
            <Header />
            
            {/* Scrollable main content */}
            <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </LoadingProvider>
    </ProtectedLayout>
  );
}