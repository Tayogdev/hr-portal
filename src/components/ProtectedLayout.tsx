// src/components/ProtectedLayout.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions"; // ✅ Update this import
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}
