import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/authContext/useAuth';

interface NavbarProps {
  isLoggedIn: boolean;
  userInitial?: string; // e.g. "M" for the avatar circle
  userName?: string;
  email?: string;
}

// Links shown when the user is logged out (public/landing navbar).
// These aren't real routes — they're section ids on the landing page that
// we scroll to, so they're rendered as buttons, not <Link>s.
const publicLinks = [
  { id: 'home', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

// Links shown when the user is logged in (app navbar) — real routes.
const appLinks = [
  { label: 'Home', href: '/home' },
  { label: 'Likes', href: '/likes' },
  { label: 'Matches', href: '/matches' },
  { label: 'Messages', href: '/messages' },
];

export default function Navbar({
  isLoggedIn,
  userInitial,
  userName,
  email,
}: NavbarProps) {
  // Controls whether the mobile full-width menu is open
  const [mobileOpen, setMobileOpen] = useState(false);
  // Controls whether the desktop profile dropdown (avatar menu) is open
  const [profileOpen, setProfileOpen] = useState(false);
  // Current route, used to highlight the active nav link
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  function goToSection(id: string) {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      requestAnimationFrame(() => {
        setTimeout(
          () =>
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }),
          60,
        );
      });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  async function handleLogout() {
    setProfileOpen(false);
    await logout();
    navigate('/', { replace: true });
  }

  return (
    // "relative" here lets the mobile dropdown below position itself
    // relative to this header instead of the whole page
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to={isLoggedIn ? '/home' : '/'}
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
                    className={`text-sm transition-colors ${
                      active
                        ? 'font-medium text-violet-600'
                        : 'text-gray-600 hover:text-gray-900'
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
            <div className="relative">
              {/* Avatar circle + chevron toggles the dropdown below */}
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-1 rounded-full"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-sm font-medium text-white">
                  {userInitial}
                </span>
                <ChevronDown size={16} className="text-gray-500" />
              </button>
              {/* Dropdown menu — only rendered when profileOpen is true */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-100 bg-white shadow-lg">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {userName}
                    </p>
                    <p className="text-sm text-gray-500">{email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className=" px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex gap-2 items-center"
                  >
                    <User size={16} />
                    View profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex gap-2 items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogout}
                      // onClick={() => setProfileOpen(false)}
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
          {isLoggedIn && (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-xs font-medium text-white">
              {userInitial}
            </span>
          )}
          {/* Toggles mobileOpen; icon swaps between hamburger and X */}
          <button
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
        <div className="absolute inset-x-0 top-0 z-50 flex flex-col bg-white shadow-lg md:hidden">
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
            <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 px-6 pt-4">
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

          {/* Logout — only shown when logged in, on mobile there's no
              dropdown to hold it, so it goes at the bottom of the menu. */}
          {isLoggedIn && (
            <div className="mt-4 border-t border-gray-100 px-6 pt-4">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="w-full text-left text-base font-medium text-gray-800"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
