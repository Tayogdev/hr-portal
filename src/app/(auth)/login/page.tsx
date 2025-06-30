'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

export default function LoginPage() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleLogin = (provider: 'google' | 'linkedin') => {
    setLoadingProvider(provider);
    signIn(provider, { callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-700">Welcome to HR Portal</h1>
        <p className="text-center text-gray-600">Sign in to continue</p>

        <button
          aria-label="Sign in with Google"
          onClick={() => handleLogin('google')}
          disabled={loadingProvider === 'google'}
          className="flex items-center gap-3 w-full border px-4 py-2 rounded text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
        >
          <Image
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            width={20}
            height={20}
          />
          <span className="text-sm font-medium">
            {loadingProvider === 'google' ? 'Signing in...' : 'Sign in with Google'}
          </span>
        </button>

        <button
          aria-label="Sign in with LinkedIn"
          onClick={() => handleLogin('linkedin')}
          disabled={loadingProvider === 'linkedin'}
          className="flex items-center gap-3 w-full bg-[#0077b5] px-4 py-2 rounded text-white hover:bg-[#005c92] transition disabled:opacity-50"
        >
          <Image
            src="https://www.svgrepo.com/show/448234/linkedin.svg"
            alt="LinkedIn"
            width={20}
            height={20}
            className="bg-white rounded-full"
          />
          <span className="text-sm font-medium">
            {loadingProvider === 'linkedin' ? 'Signing in...' : 'Sign in with LinkedIn'}
          </span>
        </button>
      </div>
    </div>
  );
}
