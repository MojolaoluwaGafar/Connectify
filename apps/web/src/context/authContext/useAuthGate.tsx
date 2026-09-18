import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthGateContextValue {
  isOpen: boolean;
  requireAuth: (action?: () => void) => boolean;
  openGate: () => void;
  closeGate: () => void;
}

const AuthGateContext = createContext<AuthGateContextValue | undefined>(
  undefined,
);

// Wrap this around the app. Any component can call `requireAuth()` before
// doing something that needs a logged-in user (liking a profile, sending a
// message, etc). If the visitor is a guest, it pops the Sign up / Login
// modal instead of performing the action.
export function AuthGateProvider({
  children,
  isAuthenticated,
}: {
  children: ReactNode;
  isAuthenticated: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  function requireAuth(action?: () => void): boolean {
    if (isAuthenticated) {
      action?.();
      return true;
    }
    setIsOpen(true);
    return false;
  }

  return (
    <AuthGateContext.Provider
      value={{
        isOpen,
        requireAuth,
        openGate: () => setIsOpen(true),
        closeGate: () => setIsOpen(false),
      }}
    >
      {children}
    </AuthGateContext.Provider>
  );
}

export function useAuthGate() {
  const ctx = useContext(AuthGateContext);
  if (!ctx) throw new Error('useAuthGate must be used within AuthGateProvider');
  return ctx;
}
