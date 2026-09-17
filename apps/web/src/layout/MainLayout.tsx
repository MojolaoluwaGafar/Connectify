import { Outlet } from "react-router-dom";
import Navbar from "./NavBar";
import Footer from "./Footer";
import { useAuth } from "../context/authContext/useAuth";
import type { ReactNode } from "react";

interface MainLayoutProps {
  children?: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, profile } = useAuth();

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
      <Footer />
    </div>
  );
};

export default MainLayout;
