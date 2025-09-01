import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { CustomSession, User } from "@/types/auth-interface";

export async function getSessionAndViewAs() {
  const session: Session | null = await getServerSession(authOptions);
  const customSession = session as CustomSession;

  const user: User = session?.user as User;

  const viewAs =
    customSession?.view != undefined ? customSession?.view : undefined;

  return { user, viewAs };
}
