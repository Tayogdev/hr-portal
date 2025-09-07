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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
      {/* Geometric Background Elements */}
      <div className="absolute inset-0">
        {/* Large Circle */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-60 transform translate-x-32 -translate-y-32"></div>
        
        {/* Medium Circle */}
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-200 to-indigo-200 rounded-full opacity-50 transform -translate-x-20 translate-y-20"></div>
        
        {/* Small decorative elements */}
        <div className="absolute bottom-8 right-8 flex space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
          <div className="w-4 h-4 bg-indigo-500 rounded-sm"></div>
          <div className="w-4 h-4 bg-purple-500 rounded-sm"></div>
        </div>
        
        {/* Diagonal geometric shape */}
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white opacity-20 transform rotate-45 translate-y-16"></div>
      </div>

      {/* Tayog Logo */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
        <div className="flex items-center flex-shrink-0">
          <img
            src="https://www.tayog.in/assets/logo/full_blue.svg"
            alt="Tayog Logo"
            className="h-8 w-auto"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full flex justify-center">
          {/* Login Card - Exact Specifications */}
          <div 
            className="bg-white border border-gray-100/50 backdrop-blur-sm shadow-xl"
            style={{
              width: '416px',
              height: '508.875px',
              borderRadius: '16px',
              padding: '32px',
              gap: '16px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div className="text-center" style={{ marginBottom: '12px' }}>
              <h1 className="text-xl font-bold text-blue-600 mb-1">
                Welcome to
              </h1>
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Organization Dashboard
              </h2>
              <p className="text-gray-500 text-xs">
                Mention your Organization credentials
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs" style={{ marginBottom: '12px' }}>
                {error}
              </div>
            )}

            <div className="flex flex-col" style={{ gap: '12px', flex: 1 }}>
              {/* Google Sign In Button */}
              <button
                onClick={() => handleLogin('google')}
                disabled={loadingProvider === 'google'}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md text-sm"
              >
                {loadingProvider === 'google' ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
                    <span className="font-medium">Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-medium text-gray-600">Login with Google</span>
                  </div>
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-gray-500 font-medium">or</span>
                </div>
              </div>

              {/* Tayog Credential Form */}
              <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '12px' }}>
                <div>
                  <input
                    id="tayog-credential"
                    name="tayog-credential"
                    type="text"
                    required
                    value={tayogCredential}
                    onChange={(e) => setTayogCredential(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-sm text-gray-700 placeholder-gray-400 bg-gray-50 focus:bg-white"
                    placeholder="Tayog Page Credential"
                  />
                </div>

                <div>
                  <input
                    id="verification-code"
                    name="verification-code"
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-sm text-gray-700 placeholder-gray-400 bg-gray-50 focus:bg-white"
                    placeholder="Verification Code <Sent to your mail id>"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                >
                  Log in
                </button>
              </form>
            </div>

            {/* Footer Text */}
            <div className="text-center" style={{ marginTop: '12px' }}>
              <p className="text-xs text-gray-500 leading-relaxed">
                You are entering to Organization Dashboard for managing<br />
                opportunities, events and Pages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
