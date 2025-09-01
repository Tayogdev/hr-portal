import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import pool from "@/dbconfig/dbconfig";
import { Session } from "next-auth";

// Extend the built-in session and user types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      uName?: string | null;
      role?: string | null;
      image?: string | null;
      isRegistered: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    uName?: string | null;
    role?: string | null;
    isRegistered: boolean;
  }
}

export interface ViewAs {
  type: "USER" | "PAGE";
  uName: string | null;
  logo?: string | null;
  name: string | null;
  id: string;
}

export interface CustomSession extends Session {
  accessToken?: string;
  accessTokenExpires?: number;
  user: {
    id: string;
    email: string;
    name: string;
    uName?: string | null;
    role?: string | null;
    image?: string | null;
    isRegistered: boolean;
  };
  view: ViewAs;
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    isRegistered?: boolean;
    accessToken?: string;
    accessTokenExpires?: number;
    refreshToken?: string;
    uName?: string | null;
    role?: string | null;
    image?: string | null;
    view?: ViewAs;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [credentials.email]
          );

          const user = result.rows[0];

          if (user && credentials.password === user.password) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              uName: user.uName ?? null,
              role: user.role ?? null,
              isRegistered: true,
            };
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    // signIn callback
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const result = await pool.query(
            'SELECT id, "uName" AS uname, name, email, role, image, "accountStatus" FROM users WHERE email = $1',
            [user.email]
          );

          const dbUser = result.rows[0];
          
          if (!dbUser) {
            return false;
          }
          if (dbUser.accountStatus !== 0) {
            return false;
          }

          user.id = dbUser.id ?? user.id;
          user.name = dbUser.name ?? user.name;
          user.email = dbUser.email ?? user.email;
          (user as any).uName = dbUser.uname ?? (user as any).uName ?? null;
          (user as any).role = dbUser.role ?? (user as any).role ?? null;
          (user as any).image = dbUser.image ?? (user as any).image ?? null;
          (user as any).isRegistered = true;

          return true;
        } catch (error) {
          console.error("Database check error:", error);
          return false;
        }
      }
      return true;
    },

    // jwt callback
    async jwt({ token, user, account, trigger, session }) {
      const t = token as any;

      t.email = t.email ?? (user as any)?.email ?? undefined;

      if (account) {
        t.accessToken = account.access_token || "";
        t.accessTokenExpires = (account as any).expires_at
          ? (account as any).expires_at * 1000
          : (account as any).expires_in
            ? Date.now() + (account as any).expires_in * 1000
            : t.accessTokenExpires;
        t.refreshToken = account.refresh_token || token.refreshToken;
      }

      if (user) {
        t.id = (user as any).id ?? t.id;
        t.uName = (user as any).uName ?? t.uName ?? null;
        t.role = (user as any).role ?? t.role ?? null;
        t.image = (user as any).image ?? t.image ?? null;
        t.name = (user as any).name ?? t.name ?? null;
        t.isRegistered = (user as any).isRegistered ?? t.isRegistered ?? false;
      }

      // Only fetch from DB if we have email but missing user data
      if (t.email && (!t.uName || !t.role || !t.image || !t.id)) {
        try {
          const res = await pool.query(
            'SELECT id, "uName" AS uname, role, image, name FROM users WHERE email = $1',
            [t.email]
          );
          const dbu = res.rows[0];
          if (dbu) {
            t.id = t.id ?? dbu.id;
            t.uName = t.uName ?? dbu.uname ?? null;
            t.role = t.role ?? dbu.role ?? null;
            t.image = t.image ?? dbu.image ?? null;
            t.name = t.name ?? dbu.name ?? null;
          }
        } catch (e) {
          console.error("jwt DB hydrate error:", e);
        }
      }

      if (!t.view) {
        t.view = {
          type: "USER",
          uName: t.uName ?? null,
          name: t.name ?? t.email ?? null,
          id: t.id ?? t.email ?? "",
          logo: t.image ?? null,
        } as ViewAs;
      }

      if (trigger === "update" && session) {
        const s = session as unknown as CustomSession;
        if (s.view) t.view = s.view;
      }

      return t;
    },

    // session callback
    async session({ session, token }) {
      const t = token as any;

      const customSession: CustomSession = {
        ...session,
        accessToken: t.accessToken ?? undefined,
        accessTokenExpires: t.accessTokenExpires ?? undefined,
        user: {
          ...session.user,
          id: t.id ?? session.user?.id ?? "",
          uName: t.uName ?? null,
          role: t.role ?? null,
          image: t.image ?? null,
          isRegistered: (t.isRegistered ??
            session.user?.isRegistered ??
            true) as boolean,
        },
        view: (t.view as ViewAs) ?? {
          type: "USER",
          uName: t.uName ?? null,
          name: t.name ?? session.user?.name ?? null,
          id: t.id ?? session.user?.email ?? "",
          logo: t.image ?? null,
        },
      };

      return customSession;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },

  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },

  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60, // 24 hours
      },
    },
  },
};
