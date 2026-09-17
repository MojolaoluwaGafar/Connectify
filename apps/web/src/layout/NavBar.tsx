import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "../context/authContext/useAuth";

interface NavbarProps {
  isLoggedIn: boolean;
  userInitial?: string; // e.g. "M" for the avatar circle — used as a fallback when there's no photo
  userPhoto?: string | null; // profile picture URL — shown instead of the initial when provided
  userName?: string;
  email?: string;
}

// Links shown when the user is logged out (public/landing navbar).
// These aren't real routes — they're section ids on the landing page that
// we scroll to, so they're rendered as buttons, not <Link>s.
const publicLinks = [
  { id: "home", label: "Home" },
  { id: "features", label: "Features" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

// Links shown when the user is logged in (app navbar) — real routes.
const appLinks = [
  { label: "Home", href: "/home" },
  { label: "Likes", href: "/likes" },
  { label: "Matches", href: "/matches" },
  { label: "Messages", href: "/messages" },
];

export default function Navbar({
  isLoggedIn,
  userInitial,
  userPhoto,
  userName,
  email,
}: NavbarProps) {
  // Controls whether the mobile full-width menu is open
  const [mobileOpen, setMobileOpen] = useState(false);
  // Controls whether the desktop profile dropdown (avatar menu) is open
  const [profileOpen, setProfileOpen] = useState(false);
  // Controls whether the "Are you sure you want to log out?" confirmation is shown
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  // Ref on the avatar+dropdown wrapper, used to detect clicks outside it
  const profileRef = useRef<HTMLDivElement>(null);
  // Refs for the mobile menu panel and its toggle button, used to detect
  // clicks outside the menu (the button is excluded so toggling doesn't
  // immediately reopen it via the outside-click handler)
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  // Current route, used to highlight the active nav link
  const location = useLocation();
  const navigate = useNavigate();

  const { logout, profile } = useAuth();

  // Use the userPhoto prop first.
  // If it isn't provided, use the profile picture from auth context.
  const profilePicture = userPhoto || profile?.profilePicture;

  // Close the profile dropdown when clicking anywhere outside it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  // Close the mobile menu when clicking anywhere outside it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        mobileButtonRef.current &&
        !mobileButtonRef.current.contains(target)
      ) {
        setMobileOpen(false);
      }
    }

    if (mobileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  function goToSection(id: string) {
    setMobileOpen(false);

    if (location.pathname !== "/") {
      navigate("/");

      requestAnimationFrame(() => {
        setTimeout(
          () =>
            document.getElementById(id)?.scrollIntoView({
              behavior: "smooth",
            }),
          60,
        );
      });
    } else {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }

  // Called when "Log out" is clicked — closes any open menus and shows
  // the confirmation dialog instead of logging out immediately
  function requestLogout() {
    setProfileOpen(false);
    setMobileOpen(false);
    setShowLogoutConfirm(true);
  }

  // Called when the user confirms in the dialog — this actually logs out
  async function confirmLogout() {
    setShowLogoutConfirm(false);
    await logout();
    navigate("/", { replace: true });
  }

  return (
    // "relative" here lets the mobile dropdown below position itself
    // relative to this header instead of the whole page
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to={isLoggedIn ? "/home" : "/"}
          className="font-serif text-xl font-semibold text-gray-900"
        >
          Connectify
        </Link>

        {/* Desktop nav links — hidden on mobile, shown from md breakpoint up */}
        <nav className="hidden items-center gap-8 md:flex">
          {isLoggedIn
            ? appLinks.map((link) => {
                const active = location.pathname === link.href;

                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setProfileOpen(false)}
                    className={`text-sm transition-colors ${
                      active
                        ? "font-medium text-violet-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })
            : publicLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => goToSection(link.id)}
                  className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                >
                  {link.label}
                </button>
              ))}
        </nav>

        {/* Right side: either the profile avatar (logged in)
            or Login/Sign Up buttons (logged out) — desktop only */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <div className="relative" ref={profileRef}>
              {/* Avatar circle + chevron toggles the dropdown below */}
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-1 rounded-full"
              >
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt={userName || "Profile"}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-sm font-medium text-white">
                    {userInitial}
                  </span>
                )}

                <ChevronDown size={16} className="text-gray-500" />
              </button>

              {/* Dropdown menu — only rendered when profileOpen is true */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-100 bg-white shadow-lg">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {userName}
                    </p>

                    <p className="break-all text-sm text-gray-500">{email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User size={16} />
                    View profile
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings size={16} />
                    Settings
                  </Link>

                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={requestLogout}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Outline-style Login button */}
              <Link
                to="/login"
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Login
              </Link>

              {/* Solid purple Sign Up button */}
              <Link
                to="/signup"
                className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile-only row: avatar (if logged in) + hamburger/close icon */}
        <div className="flex items-center gap-3 md:hidden">
          {isLoggedIn &&
            (profilePicture ? (
              <img
                src={profilePicture}
                alt={userName || "Profile"}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-xs font-medium text-white">
                {userInitial}
              </span>
            ))}

          {/* Toggles mobileOpen; icon swaps between hamburger and X */}
          <button
            ref={mobileButtonRef}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel — only rendered when mobileOpen is true.
          Sized to fit its own content (not a full-screen overlay),
          so whatever's below it on the page still shows through. */}
      {mobileOpen && (
        <div
          ref={mobileMenuRef}
          className="absolute inset-x-0 top-0 z-50 flex flex-col bg-white shadow-lg md:hidden"
        >
          {/* Repeats the logo + shows an X (instead of hamburger) to close */}
          <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
            <span className="font-serif text-xl font-semibold text-gray-900">
              Connectify
            </span>

            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={24} className="text-gray-700" />
            </button>
          </div>

          {/* Stacked nav links; clicking one also closes the menu */}
          <nav className="flex flex-col gap-4 px-6 pt-6">
            {isLoggedIn
              ? appLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-base text-gray-800"
                  >
                    {link.label}
                  </Link>
                ))
              : publicLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => goToSection(link.id)}
                    className="text-left text-base text-gray-800"
                  >
                    {link.label}
                  </button>
                ))}
          </nav>

          {/* Login/Sign Up buttons — only shown when logged out.
              Divider line (border-t) separates them from the links above. */}
          {!isLoggedIn && (
            <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 px-6 pb-10 pt-4">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full rounded-full border border-gray-300 py-3 text-center text-base font-medium text-gray-800"
              >
                Login
              </Link>

              <Link
                to="/signup"
                onClick={() => setMobileOpen(false)}
                className="w-full rounded-full bg-violet-600 py-3 text-center text-base font-medium text-white"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* View profile / Settings / Log out — only shown when logged in,
              on mobile there's no dropdown to hold these, so they go at
              the bottom of the menu. */}
          {isLoggedIn && (
            <div className="mt-4 flex flex-col gap-4 border-t border-gray-100 px-6 pb-10 pt-4">
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 text-base text-gray-800"
              >
                <User size={18} />
                View profile
              </Link>

              <button
                onClick={requestLogout}
                className="flex items-center gap-3 text-left text-base font-medium text-red-600"
              >
                <LogOut size={18} />
                Log out
              </button>
            </div>
          )}
        </div>
      )}

      {/* Logout confirmation dialog — sits on top of everything, dims the
          rest of the page behind it */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="flex h-70 w-full max-w-lg flex-col items-center justify-center rounded-xl bg-white p-10 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Log out?</h2>

            <p className="mt-2 text-center text-sm text-gray-500">
              Are you sure you want to log out of your account?
            </p>

            <div className="mt-6 flex w-full flex-col gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className=" w-full rounded-md border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={confirmLogout}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
