import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./NavBar";
import Footer from "./Footer";
import { useAuth } from "../context/authContext/useAuth";
import type { ReactNode } from "react";

interface MainLayoutProps {
  children?: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, profile } = useAuth();
  const location = useLocation();

  // The footer's own height eats into the chat view's already-tight
  // fixed height (see ChatWindow's h-[calc(100vh-120px)]), which gets
  // worse once the on-screen keyboard shrinks the viewport on mobile —
  // no messaging UI shows a footer inside the chat itself, so skip it here.
  const hideFooter = location.pathname.startsWith("/messages");

  return (
    <div className="h-screen grid grid-rows-[auto_1fr_auto]">
      <Navbar
        isLoggedIn={Boolean(user)}
        userInitial={profile?.fullName?.[0]}
        userName={profile?.fullName}
        email={user?.email}
        userPhoto={profile?.profilePicture}
      />

      <main>
        {/* <DiscoveryPage></DiscoveryPage> */}
        {children ?? <Outlet />}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
