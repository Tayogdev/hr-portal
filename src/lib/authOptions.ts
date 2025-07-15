import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import { NextAuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import pool from "@/dbconfig/dbconfig";

// 1. Extend session and JWT types
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

// 2. Auth config
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
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },

  debug: process.env.NODE_ENV === "development",

  callbacks: {
    // 3. Check if user exists (no insert — just verify)
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        const res = await pool.query(
          `SELECT id, "accountStatus" FROM users WHERE email = $1 AND ("isDeleted" = false OR "isDeleted" IS NULL)`,
          [user.email]
        );

        if (res.rows.length === 0) {
          console.log(`❌ Email not registered in Tayog: ${user.email}`);
          return false;
        }

        const dbUser = res.rows[0];
        if (dbUser.accountStatus !== 0) {
          console.log(`❌ Inactive account: ${user.email}`);
          return false;
        }

        return true;
      } catch (err) {
        console.error("❌ Error during signIn:", err);
        return false;
      }
    },

    // 4. JWT: Inject correct ID and isRegistered
    async jwt({ token, user }) {
      if (user?.email) {
        try {
          const res = await pool.query(
            `SELECT id FROM users WHERE email = $1 AND ("isDeleted" = false OR "isDeleted" IS NULL)`,
            [user.email]
          );

          if (res.rows.length > 0) {
            token.id = res.rows[0].id; // ✅ Inject your Tayog user ID here
            token.isRegistered = true;
          } else {
            token.isRegistered = false;
          }
        } catch (err) {
          console.error("❌ JWT Error:", err);
          token.isRegistered = false;
        }
      }

      return token;
    },

    // 5. Session: Inject same ID from JWT into session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.isRegistered = token.isRegistered as boolean;
      }

      return session;
    },
  },
};
