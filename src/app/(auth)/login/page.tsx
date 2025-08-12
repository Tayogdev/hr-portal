'use client';

import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import logger from '@/lib/logger';

export default function LoginPage() {
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<'google' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tayogCredential, setTayogCredential] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const handleLogin = async (provider: 'google') => {
    setLoadingProvider(provider);
    setError(null);

    try {
      const result = await signIn(provider, {
        callbackUrl: '/dashboard',
        redirect: false,
      });

      if (result?.error) {
        logger.error('Sign-in error', new Error(result.error), 'LoginPage', {
          provider,
          error: result.error,
        });
        
        // Handle specific error cases
        if (result.error === 'AccessDenied') {
          setError('User not found. Please register on tayog.in to access this dashboard.');
        } else if (result.error === 'OAuthSignin') {
          setError('Google sign-in failed. Please try again.');
        } else {
          setError('Please register on tayog.in and create pages.');
        }
        return;
      }

      // Add small delay to allow session to stabilize
      await new Promise(res => setTimeout(res, 300));

      const session = await getSession();

      if (session && session.user?.isRegistered) {
        router.push('/dashboard');
      } else {
        setError('User not found. Please register on tayog.in to access this dashboard.');
      }
    } catch (err) {
      logger.error('Unexpected error during login', err as Error, 'LoginPage', {
        provider,
      });
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    logger.info('Tayog credential login attempt', 'LoginPage', {
      hasCredential: !!tayogCredential,
      hasVerificationCode: !!verificationCode,
    });
    setError('Tayog credential login is not implemented yet. Please use Google login.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your HR Portal dashboard
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Google Sign In */}
          <button
            onClick={() => handleLogin('google')}
            disabled={loadingProvider === 'google'}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingProvider === 'google' ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </div>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or</span>
            </div>
          </div>

          {/* Tayog Credential Form (Placeholder) */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="tayog-credential" className="block text-sm font-medium text-gray-700">
                Tayog Credential
              </label>
              <input
                id="tayog-credential"
                name="tayog-credential"
                type="text"
                required
                value={tayogCredential}
                onChange={(e) => setTayogCredential(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your Tayog credential"
              />
            </div>

            <div>
              <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                id="verification-code"
                name="verification-code"
                type="text"
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter verification code"
              />
            </div>

            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Sign in with Tayog Credential
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
