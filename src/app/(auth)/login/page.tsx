'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [tayogCredential, setTayogCredential] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle error from URL parameters (e.g., from middleware redirect)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'not_registered') {
      setError('User not found. Please register on tayog.in to access this dashboard.');
    } else if (errorParam === 'AccessDenied') {
      setError('Access denied. Please register on tayog.in and create pages.');
    }
  }, [searchParams]);

  const handleLogin = async (provider: 'google') => {
    setLoadingProvider(provider);
    setError(null);

    try {
      const result = await signIn(provider, {
        callbackUrl: '/dashboard',
        redirect: false,
      });

      if (result?.error) {
        console.error("signIn error:", result.error);
        
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
      console.error("Unexpected error during login:", err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    console.log('Tayog Credential:', tayogCredential);
    console.log('Verification Code:', verificationCode);
    setError('Tayog credential login is not implemented yet. Please use Google login.');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden p-4">
      {/* Background Image */}
      <Image
        src="/login-bg.png"
        alt="Login Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        className="z-0"
      />

      {/* White overlay for clarity */}
      <div className="absolute inset-0 bg-white opacity-90 z-10"></div>

      {/* Tayog Logo */}
      <div className="absolute top-8 left-8 z-20">
        <Image
          src="/tayog-logo.svg"
          alt="Tayog Logo"
          width={120}
          height={40}
          className="h-10 w-auto"
        />
      </div>

      {/* Main Login Card */}
      <div className="relative z-30 bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-700">
          Welcome to <br /> Organization Dashboard
        </h1>
        <p className="text-center text-gray-600 text-sm sm:text-base">
          Mention your Organization credentials
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Access Denied</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-3 text-sm text-red-600">
                  <p>
                    If you believe this is an error, please contact support at{' '}
                    <a href="mailto:support@tayog.in" className="underline font-medium">
                      support@tayog.in
                    </a>
                  </p>
                </div>
                <div className="mt-3 text-sm text-blue-600">
                  <p>
                    New to Tayog?{' '}
                    <a 
                      href="https://tayog.in" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline font-medium hover:text-blue-800"
                    >
                      Register here
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Google Login Button */}
        <button
          aria-label="Sign in with Google"
          onClick={() => handleLogin('google')}
          disabled={loadingProvider === 'google'}
          className="flex items-center justify-center gap-3 w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Image
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            width={20}
            height={20}
          />
          <span className="text-sm font-medium">
            {loadingProvider === 'google' ? 'Signing in...' : 'Login with Google'}
          </span>
        </button>

        {/* OR Separator */}
        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-sm">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Tayog Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tayogCredential" className="block text-sm font-medium text-gray-700 mb-1">
              Tayog Page Credential
            </label>
            <input
              type="text"
              id="tayogCredential"
              value={tayogCredential}
              onChange={(e) => setTayogCredential(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter your credential"
              required
            />
          </div>

          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter code"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Sent to your mail Id</p>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
          >
            Log in
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-4">
          You are entering to Organization Dashboard for managing opportunities, events and Pages.
        </p>
      </div>

      {/* Bottom right indicators (optional) */}
      <div className="absolute bottom-4 right-4 flex space-x-1 z-30">
        <div className="w-3 h-3 bg-blue-600 rounded-sm" />
        <div className="w-3 h-3 bg-blue-600 rounded-sm" />
        <div className="w-3 h-3 bg-blue-600 rounded-sm" />
      </div>
    </div>
  );
}
