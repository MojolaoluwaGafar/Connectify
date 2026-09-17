import { Navigate, useLocation } from 'react-router-dom';

import type { ReactNode } from 'react';
import { useAuth } from '../context/authContext/useAuth';

// Wraps routes that require a logged-in user (Likes, Matches, Messages,
// Profile). Guests are bounced to /login and sent back after they sign in.
// TODO: BACKEND — this currently checks localStorage-derived state; with a
// real backend it'll check a verified JWT/session cookie instead.
//
// Note: this only checks auth, not profile completeness — users without a
// (complete) profile can still freely browse /home, /messages, etc. The
// no-profile / incomplete-profile redirect only applies to the /profile
// route itself (see MyProfilepage.tsx).
interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-theme" />
      </div>
    );

  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
}

// import { Navigate, useLocation } from 'react-router-dom';
// import type { ReactNode } from 'react';
// import { useAuth } from '../context/authContext/useAuth';

// interface Props {
//   children: ReactNode;
// }

// export default function ProtectedRoute({ children }: Props) {
//   const { user, isLoading } = useAuth();
//   const location = useLocation();

//   if (isLoading)
//     return (
//       <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-theme" />
//     );

//   if (!user) {
//     return <Navigate to="/login" replace state={{ from: location.pathname }} />;
//   }

//   return children;
// }
