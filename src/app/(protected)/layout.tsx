import CustomNavbar from './sidebar/CustomNavbar';
import Header from './header/Header';
import ProtectedLayout from '../../components/ProtectedLayout';

export default function ProtectedGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout>
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Sidebar - This is the fixed sidebar */}
        <CustomNavbar />

        {/* Main content area - This div needs to shift right for the fixed sidebar */}
        <div className="flex-1 flex flex-col overflow-hidden **md:ml-64**"> {/* <-- Key change here */}
          {/* Header - This will stick to the top of this content area */}
          <Header />
          <main className="flex-1 overflow-y-auto p-4 bg-[#F8FAFC]">
            {children}
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}