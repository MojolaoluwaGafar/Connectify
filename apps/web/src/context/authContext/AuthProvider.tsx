import { useEffect, useState, type ReactNode } from 'react';
import type { User, Profile } from '../../types/index';

import * as api from '../../API/Services/Auth/authApi';
import { getMyProfile } from '../../API/Services/Profile/Profile';
import { AuthContext } from './authContext';


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  

  useEffect(() => {
    (async () => {
      try {
        const session = await api.getSession();
        if (session) {
          const current = await api.getCurrentUser();
          setUser(current);

          if (current?.id) {
            const p = await getMyProfile();
            setProfile(p);
          }
        }
      } catch (err) {
        // No valid session, or the request failed — treat as logged out
        // rather than hanging on the loading screen.
        console.error('Failed to restore session:', err);
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function refreshProfile() {
    if (!user) return;
    const p = await getMyProfile();
    setProfile(p);
  }

  async function login(email: string, password: string) {
    const loggedInUser = await api.login(email, password);
    setUser(loggedInUser);
    const p = await getMyProfile();
    setProfile(p);
  }
  async function googleLogin(idToken: string) {
  const loggedInUser = await api.googleLogin(idToken);

  setUser(loggedInUser);

  const p = await getMyProfile();
  setProfile(p);
}

  async function logout() {
    await api.logout();
    setUser(null);
    setProfile(null);
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    await api.changePassword(currentPassword, newPassword);
  }

  async function deleteAccount() {
    await api.deleteAccount();
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
        googleLogin,
        signup,
        verifyEmail,
        resendVerificationCode,
        requestPasswordReset,
        resetPassword,
        setUserAfterVerification,
        changePassword,
        deleteAccount,

      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
