// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  console.log("✅ Using AuthLayout"); // ✅ Debug line to verify
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
