import { useEffect, useState, type ReactNode } from "react";
import type { User, Profile } from "../../types/index";

import * as api from "../../lib/mockApi";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, check for an existing "session" the same way a real app
  // would check a cookie/JWT — here it's just localStorage.
  // TODO: BACKEND — replace with a `GET /api/auth/me` call using the stored
  // JWT/cookie to rehydrate the session.
  useEffect(() => {
    (async () => {
      const session = api.getSession();
      if (session) {
        const current = await api.getCurrentUser(session.userId);
        setUser(current);
        if (current) {
          const p = await api.getProfile(current.id);
          setProfile(p);
        }
      }
      setIsLoading(false);
    })();
  }, []);

  async function refreshProfile() {
    if (!user) return;
    const p = await api.getProfile(user.id);
    setProfile(p);
  }

  async function login(email: string, password: string) {
    const loggedInUser = await api.login(email, password);
    setUser(loggedInUser);
    const p = await api.getProfile(loggedInUser.id);
    setProfile(p);
  }

  async function logout() {
    await api.logout();
    setUser(null);
    setProfile(null);
  }

  async function signup(fullName: string, email: string, password: string) {
    await api.signUp(fullName, email, password);
    // Note: no user/session yet — signUp only creates the account and sends
    // a verification code. user stays null until verifyEmail() + login()
    // (or setUserAfterVerification) run.
  }
  async function verifyEmail(email: string, code: string) {
    await api.verifyEmail(email, code);
  }
  async function resendVerificationCode(email: string) {
    await api.resendVerificationCode(email);
  }
  async function resetPassword(
    email: string,
    token: string,
    newPassword: string,
  ) {
    await api.resetPassword(email, token, newPassword);
  }
  async function requestPasswordReset(email: string) {
    await api.requestPasswordReset(email);
  }

  function setUserAfterVerification(u: User) {
    setUser(u);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        refreshProfile,
        login,
        logout,
        signup,
        verifyEmail,
        resendVerificationCode,
        requestPasswordReset,
        resetPassword,
        setUserAfterVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}