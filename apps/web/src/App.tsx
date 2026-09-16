import { useEffect, type ReactNode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DiscoveryPage from './pages/DiscoveryPage';
import ProtectedRoutes from './layout/ProtectedRoutes';
import MainLayout from './layout/MainLayout';
import { AuthProvider } from './context/authContext/AuthProvider';

import PageNotFound from './pages/PageNotFound';
import Settings from './pages/SettingsPage';
import Matches from './pages/MatchesPage';
import MyProfilePage from './pages/MyProfilepage';

import ProfilePage from './pages/ProfilePage';
import ProfileEditPage from './pages/ProfileEditPage';
import { AuthGateProvider } from './context/authContext/useAuthGate';
import LikesPage from './pages/LikesPage';
import { useAuth } from './context/authContext/useAuth';
import MessagesPage from './pages/MessagesPage';
import SignupPage from './pages/auth/SignUpPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import CheckEmailPage from './pages/auth/CheckEmailPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import LoginPage from './pages/auth/LoginPage';
import LandingPage from './pages/LandingPage';
import GuestOnlyRoute from './layout/GuestOnlyRoutes';
import { MatchesModal } from './components/MatchModal';
import LikesProvider from './context/likeContext/LikesProvider';
import { connectSocket, disconnectSocket } from './lib/socket';

// Everything that needs to know "is someone logged in" (the auth gate modal,
// the likes/matches state) lives inside AuthProvider so it can read that.
function Providers({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  // const { data } = getUser();
  // console.log(data);

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
          </Providers>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}
