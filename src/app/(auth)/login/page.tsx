'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

export default function LoginPage() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [tayogCredential, setTayogCredential] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const handleLogin = (provider: 'google') => { // Only 'google' remains as an option
    setLoadingProvider(provider);
    signIn(provider, { callbackUrl: '/' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send tayogCredential and verificationCode to your backend for authentication.
    // For demonstration, we'll just log them.
    console.log('Tayog Credential:', tayogCredential);
    console.log('Verification Code:', verificationCode);
    // You might want to add a loading state here for this form submission too
    // and handle success/error responses from your API.
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100 overflow-hidden p-4">
      {/* Background Shape */}
      <div
        className="absolute top-0 left-0 w-2/3 h-full bg-blue-100 rounded-br-[250px] transform origin-top-left -rotate-6 scale-125 md:rounded-br-[400px] md:w-1/2 lg:w-2/5 xl:w-1/3"
        style={{
          // Custom styles for a more specific shape or adjustment
          zIndex: 0, // Ensure it's behind the content
          filter: 'blur(50px)', // Soften the edges if desired
          opacity: 0.7,
        }}
      ></div>

      {/* Tayog Logo */}
      <div className="absolute top-8 left-8 z-20">
        <Image
          src="/tayog-logo.svg" // **IMPORTANT: Replace with the actual path to your Tayog logo**
          alt="Tayog Logo"
          width={120} // Adjust width as needed
          height={40} // Adjust height as needed
          className="h-10 w-auto"
        />
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-700">
          Welcome to <br /> Organization Dashboard
        </h1>
        <p className="text-center text-gray-600 text-sm sm:text-base">
          Mention your Organization credentials
        </p>  

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

          {/* Main Login Button */}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
          >
            Log in
          </button>
        </form>

        {/* Disclaimer Text */}
        <p className="text-center text-gray-500 text-xs mt-4">
          You are entering to Organization Dashboard for managing opportunities, events and Pages.
        </p>
      </div>
    </div>
  );
}