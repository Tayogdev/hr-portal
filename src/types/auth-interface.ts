import { Session } from "next-auth";

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

export interface User {
  id: string;
  email: string;
  name: string;
  uName?: string | null;
  role?: string | null;
  isRegistered: boolean;
}
