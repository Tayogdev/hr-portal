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
      <div className="flex flex-col md:flex-row min-h-screen overflow-hidden">
        {/* Sidebar */}
        <CustomNavbar />

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 bg-[#F8FAFC]">
            {children}
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
  