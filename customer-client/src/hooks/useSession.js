import { useEffect, useState } from "react";
import {
  clearSession,
  getSession,
  saveSession,
  subscribeToSessionChange,
  updateSessionUser
} from "../auth/authStorage";

export function useSession() {
  const [session, setSession] = useState(getSession());

  useEffect(() => subscribeToSessionChange(() => setSession(getSession())), []);

  return {
    session,
    user: session?.user || null,
    token: session?.token || "",
    isAuthenticated: Boolean(session?.token),
    setSession: saveSession,
    clearSession,
    updateUser: updateSessionUser
  };
}
