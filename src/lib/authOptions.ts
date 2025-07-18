import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import pool from '@/dbconfig/dbconfig';

// Extend the built-in session and user types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      isRegistered: boolean;
    }
  }
  
  interface User {
    id: string;
    email: string;
    name: string;
    isRegistered: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isRegistered: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [credentials.email]
          );

          const user = result.rows[0];

          if (user && credentials.password === user.password) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              isRegistered: true
            };
          }

          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Google OAuth, check if user exists in our database
      if (account?.provider === 'google' && user.email) {
        try {
          const result = await pool.query(
            'SELECT id, name, email, "userVerified", "accountStatus" FROM users WHERE email = $1',
            [user.email]
          );

          const dbUser = result.rows[0];

          if (!dbUser) {
            // User not found in database
            return false; // This will trigger the error callback
          }

          // Check if account is active
          if (dbUser.accountStatus !== 0) {
            return false; // Account is suspended or inactive
          }

          // Update user object with database info
          user.id = dbUser.id;
          user.name = dbUser.name || user.name;
          user.isRegistered = true;

          return true;
        } catch (error) {
          console.error('Database check error:', error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isRegistered = user.isRegistered;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.isRegistered = token.isRegistered;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET
};
