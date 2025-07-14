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
      isRegistered?: boolean;
    };
  }
  interface JWT {
    id?: string;
    isRegistered?: boolean;
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
    error: "/login", // Redirect to login page on error
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
    async signIn({ user }) {
      if (!user.email) {
        console.log('Sign in failed: No email provided');
        return false;
      }

      try {
        // Check if user exists in database by email
        const checkUserQuery = `
          SELECT id, name, email, image, "isDeleted", "accountStatus", "userVerified"
          FROM users 
          WHERE email = $1 AND ("isDeleted" = false OR "isDeleted" IS NULL)
        `;
        
        const result = await pool.query(checkUserQuery, [user.email]);
        
        if (result.rows.length === 0) {
          console.log(`Sign in failed: User with email ${user.email} not found in database`);
          return false; // User not registered, deny access
        }

        const dbUser = result.rows[0];

        // Check if user account is active
        if (dbUser.accountStatus !== 0) {
          console.log(`Sign in failed: User account status is ${dbUser.accountStatus}`);
          return false; // Account is suspended or inactive
        }

        // Optionally check if user is verified (uncomment if needed)
        // if (!dbUser.userVerified) {
        //   console.log(`Sign in failed: User email ${user.email} is not verified`);
        //   return false;
        // }

        console.log(`Sign in successful: User ${user.email} found in database`);
        return true; // User exists and is valid, allow sign in

      } catch (dbError) {
        console.error('Database error during sign in:', dbError);
        return false; // Database error, deny access for security
      }
    },

    async jwt({ token, user }) {
      if (user) {
        try {
          // Get user data from database using email
          const getUserQuery = `
            SELECT id, name, email, image, "userVerified", "accountStatus"
            FROM users 
            WHERE email = $1 AND ("isDeleted" = false OR "isDeleted" IS NULL)
          `;
          
          const result = await pool.query(getUserQuery, [user.email]);
          
          if (result.rows.length > 0) {
            const dbUser = result.rows[0];
            
            // Always use the database user ID - this is the correct approach
            token.id = dbUser.id;
            token.isRegistered = true;
            
            // Update user's OAuth information if needed
            const updateUserQuery = `
              UPDATE users 
              SET 
                name = COALESCE($1, name),
                image = COALESCE($2, image)
              WHERE id = $3
            `;
            
            await pool.query(updateUserQuery, [
              user.name || dbUser.name,
              user.image || dbUser.image,
              dbUser.id
            ]);
            
            console.log(`JWT updated for user: ${user.email} with ID: ${token.id}`);
          } else {
            token.isRegistered = false;
            console.log(`JWT creation failed: User ${user.email} not found`);
          }
        } catch (dbError) {
          console.error('Error updating user data:', dbError);
          token.isRegistered = false;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.isRegistered = token.isRegistered as boolean;
      }
      return session;
    },
  },
};