import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/authContext/useAuth';

// The inverse of ProtectedRoutes: wraps pages that only make sense for a
// logged-OUT visitor (landing page, login, signup). If someone is already
// authenticated and lands here — e.g. clicking a bookmark to "/", or
// hitting the back button after logging in — bounce them into the app

interface Props {
  children: ReactNode;
}

export default function GuestOnlyRoute({ children }: Props) {
  const { isLoading, user } = useAuth();

  if (isLoading)
    return (
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-theme" />
    );

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
