// src/lib/authOptions.ts
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import { NextAuthOptions } from "next-auth";
import pool from "@/dbconfig/dbconfig";

// Extend the default session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  interface JWT {
    id?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  // Optimize session and JWT handling to reduce memory usage
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Disable debug mode in production to reduce memory usage
  debug: process.env.NODE_ENV === "development",
  // Optimize callbacks to prevent memory leaks and ensure user exists in database
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        // Use the OAuth provider's user ID
        token.id = user.id;
        
        // Store user in database if not exists (upsert)
        try {
          const upsertUserQuery = `
            INSERT INTO users (id, name, email, image, provider)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              email = EXCLUDED.email,
              image = EXCLUDED.image,
              "updatedAt" = CURRENT_TIMESTAMP
          `;
          
          await pool.query(upsertUserQuery, [
            user.id,
            user.name || '',
            user.email || '',
            user.image || '',
            account.provider
          ]);
                 } catch (dbError) {
           console.log('Note: User table may not exist yet, continuing with OAuth ID only:', dbError instanceof Error ? dbError.message : 'Unknown error');
         }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
