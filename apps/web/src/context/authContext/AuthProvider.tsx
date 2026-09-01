import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { useApiMutation } from '../../hooks/useApiMutation';
import * as authApi from '../../services/authApi';
import type { User, Profile } from '../../types/index';
import { AuthContext } from './authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const session = await authApi.getSession();
        if (!session) {
          setUser(null);
          setProfile(null);
          return;
        }

        const currentUser = await authApi.getCurrentUser(session.userId);
        setUser(currentUser);

        if (currentUser) {
          const currentProfile = await authApi.getProfile(currentUser.id);
          setProfile(currentProfile ?? null);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const loginMutation = useApiMutation(
    async ({ email, password }: { email: string; password: string }) => {
      const loggedInUser = await authApi.login(email, password);
      const nextProfile = await authApi.getProfile(loggedInUser.id);
      setUser(loggedInUser);
      setProfile(nextProfile ?? null);
      return loggedInUser;
    },
    'Unable to sign in',
  );

  const logoutMutation = useApiMutation<undefined, void>(async () => {
    await authApi.logout();
    setUser(null);
    setProfile(null);
  }, 'Unable to sign out');

  const signupMutation = useApiMutation(
    async ({ fullName, email, password }: { fullName: string; email: string; password: string }) => {
      await authApi.signUp(fullName, email, password);
    },
    'Unable to create account',
  );

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const nextProfile = await authApi.getProfile(user.id);
    setProfile(nextProfile ?? null);
  }, [user]);

  const login = useCallback(
    async (email: string, password: string) => {
      await loginMutation.mutate({ email, password });
    },
    [loginMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutate(undefined);
  }, [logoutMutation]);

  const signup = useCallback(
    async (fullName: string, email: string, password: string) => {
      await signupMutation.mutate({ fullName, email, password });
    },
    [signupMutation],
  );

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
        setUserAfterVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
