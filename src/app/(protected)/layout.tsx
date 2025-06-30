// app/(protected)/layout.tsx
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
      <div className="flex flex-col min-h-screen md:flex-row">
        <CustomNavbar />
        <main className="flex-1 bg-[#F8FAFC]">
          <Header />
          <div className="p-4">{children}</div>
        </main>
      </div>
    </ProtectedLayout>
  );
}
