import Layout from '@/components/Layout';
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
        <Layout currentView={viewAs}>
          {children}
        </Layout>
      </PageProvider>
    </LoadingProvider>
  );
}