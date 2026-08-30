import { createContext } from 'react';
import type { User, Profile } from '../../types/index';

export interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  setUserAfterVerification: (user: User) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
