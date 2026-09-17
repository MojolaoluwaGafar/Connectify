import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import ProtectedRoutes from './layout/ProtectedRoutes';
import MainLayout from './layout/MainLayout';
import { AuthProvider } from './context/authContext/AuthProvider';

import { AuthGateProvider } from './context/authContext/useAuthGate';
import { useAuth } from './context/authContext/useAuth';
import GuestOnlyRoute from './layout/GuestOnlyRoutes';

// Lazy-loaded so each route ships only the JS it needs, instead of one big
// bundle everyone downloads up front — a real win on slower mobile data.
const DiscoveryPage = lazy(() => import('./pages/DiscoveryPage'));
const PageNotFound = lazy(() => import('./pages/PageNotFound'));
const Settings = lazy(() => import('./pages/SettingsPage'));
const Matches = lazy(() => import('./pages/MatchesPage'));
const MyProfilePage = lazy(() => import('./pages/MyProfilepage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ProfileEditPage = lazy(() => import('./pages/ProfileEditPage'));
const LikesPage = lazy(() => import('./pages/LikesPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const SignupPage = lazy(() => import('./pages/auth/SignUpPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
const ForgotPasswordPage = lazy(
  () => import('./pages/auth/ForgotPasswordPage'),
);
const CheckEmailPage = lazy(() => import('./pages/auth/CheckEmailPage'));
const ResetPasswordPage = lazy(
  () => import('./pages/auth/ResetPasswordPage'),
);
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
import { MatchesModal } from './components/MatchModal';
import LikesProvider from './context/likeContext/LikesProvider';
import { connectSocket, disconnectSocket, getActiveConversationId, socket } from './lib/socket';

import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import "./toast.css"
import { themedToast } from './utils/ToastFeedback';

function RouteLoadingFallback() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-theme" />
    </div>
  );
}

// Everything that needs to know "is someone logged in" (the auth gate modal,
// the likes/matches state) lives inside AuthProvider so it can read that.
function Providers({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state?.loginSuccess) return;

    themedToast.success('Login Successful!');

    navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (!user?.id) {
      disconnectSocket();
      console.log('no user found');
      return;
    }

    connectSocket();
    console.log('user found');

    return () => {
      disconnectSocket();
    };
  }, [user?.id]);

  // Global "new message" notification — fires no matter which page the
  // user is on. Suppressed only when they already have that exact
  // conversation open, since ChatWindow renders the message live there.
  useEffect(() => {
    if (!user?.id) return;

    const handleNewMessageNotification = (payload: {
      conversationId: string;
      senderName: string;
      text: string;
    }) => {
      if (payload.conversationId === getActiveConversationId()) return;

      themedToast.info(`New message from ${payload.senderName}`);
    };

    socket.on('new_message_notification', handleNewMessageNotification);

    return () => {
      socket.off('new_message_notification', handleNewMessageNotification);
    };
  }, [user?.id]);

  return (
    <AuthGateProvider isAuthenticated={Boolean(user)}>
      <LikesProvider>
        <MatchesModal></MatchesModal>
        {children}
      </LikesProvider>
    </AuthGateProvider>
  );
}

export default function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Providers>
            <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              <Route
                path="/"
                element={
                  <GuestOnlyRoute>
                    <MainLayout>
                      <LandingPage />
                    </MainLayout>
                  </GuestOnlyRoute>
                }
              ></Route>
              <Route
                path="/signup"
                element={
                  <GuestOnlyRoute>
                    <SignupPage />
                  </GuestOnlyRoute>
                }
              />

              <Route
                path="/login"
                element={
                  <GuestOnlyRoute>
                    <LoginPage />
                  </GuestOnlyRoute>
                }
              />

              <Route path="/verify-email" element={<VerifyEmailPage />} />

              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              <Route path="/check-email" element={<CheckEmailPage />} />

              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route
                element={
                  <ProtectedRoutes>
                    <MainLayout />
                  </ProtectedRoutes>
                }
              >
                {/* No more `index` route here — "/" is fully owned by
                    LandingPage above. Having both meant a logged-out visitor
                    hitting "/" could match this protected layout instead,
                    get bounced back to "/" by ProtectedRoutes, match this
                    layout again, and loop forever. */}
                <Route
                  path="home"
                  element={<DiscoveryPage></DiscoveryPage>}
                ></Route>
                <Route
                  path="profile"
                  element={<MyProfilePage></MyProfilePage>}
                ></Route>
                <Route
                  path="profile/edit"
                  element={<ProfileEditPage />}
                ></Route>
                <Route
                  path="profile/:id"
                  element={<ProfilePage></ProfilePage>}
                ></Route>
                <Route path="messages" element={<MessagesPage />}></Route>
                <Route path="matches" element={<Matches></Matches>}></Route>
                <Route path="likes" element={<LikesPage />}></Route>
                <Route path="settings" element={<Settings></Settings>}></Route>
              </Route>
              <Route>
                <Route path="*" element={<PageNotFound></PageNotFound>} />
              </Route>
            </Routes>
            </Suspense>

            <ToastContainer  position='top-center' autoClose={3000} hideProgressBar={false}
            newestOnTop={false} closeOnClick pauseOnHover draggable />
          </Providers>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}
