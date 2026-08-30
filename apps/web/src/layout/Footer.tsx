import { Link } from 'react-router-dom';
import { InstagramIcon, MiddleIcon, FacebookIcon } from '../assets/SocialIcons';

// Links shown under the "Quick Links" column
const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Discover people', href: '/home' },
  { label: 'Likes', href: '/likes' },
  { label: 'Matches', href: '/matches' },
  { label: 'Sign up', href: '/signup' },
];

// Links shown under the "Features" column
const featureLinks = [
  { label: 'Discover people', href: '/home' },
  { label: 'Match & connect', href: '/matches' },
  { label: 'Real-time chat', href: '/messages' },
  { label: 'Likes', href: '/likes' },
];

// Links shown under the "Legal" column
const legalLinks = [
  { label: 'Privacy policy', href: '/privacy' },
  { label: 'Terms of service', href: '/terms' },
  { label: 'Cookie policy', href: '/cookies' },
  { label: 'Safety tips', href: '/safety' },
];

export default function Footer() {
  // Copyright year — hardcoded to match the reference design.
  // (Could use new Date().getFullYear() instead if you want it to
  // update automatically every year.)
  const year = 2025;

  return (
    // Dark background wrapper for the whole footer
    <footer className="bg-[#15111f] text-gray-300">
      {/* Centers content and caps its max width; adds side/vertical padding */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Main grid: 2 columns on mobile, 4 columns from sm breakpoint up */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
          {/* Brand block: spans both mobile columns (full width),
              becomes just 1 column on desktop */}
          <div className="col-span-2 sm:col-span-1">
            {/* Logo text */}
            <span className="font-serif text-xl font-semibold text-white">
              Connectify
            </span>
            {/* Short description under the logo */}
            <p className="mt-3 text-sm text-gray-400">
              Bringing together like-minded people from around the world.
              Discover, connect and chat with people who truly get you.
            </p>
            {/* Row of social icons */}
            <div className="mt-4 flex gap-4">
              <a
                href="#"
                aria-label="Instagram"
                className="text-white/60 hover:text-white"
              >
                <InstagramIcon size={17} />
              </a>
              <a
                href="#"
                aria-label="Threads"
                className="text-white/60 hover:text-white"
              >
                <MiddleIcon size={10} />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="text-white/60 hover:text-white"
              >
                <FacebookIcon size={9} />
              </a>
            </div>
          </div>

          {/* Quick Links column — pairs side-by-side with Features on mobile
              (col-span-1 means it takes half the 2-col mobile grid) */}
          <div className="col-span-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              {/* Loop through quickLinks array and render one <li> per link */}
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-300 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features column — same pattern as Quick Links */}
          <div className="col-span-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Features
            </h3>
            <ul className="mt-4 space-y-2">
              {featureLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-300 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal column — spans both mobile columns (full width),
              same as the brand block, so it drops to its own row on mobile */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-300 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row: divider line + Terms/Privacy links + copyright text.
            Centered and stacked on mobile, side-by-side and left-aligned on desktop */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-gray-800 pt-6 text-center sm:flex-row sm:items-center sm:text-left">
          <div className="flex gap-4 text-xs text-gray-400">
            <Link to="/terms" className="hover:text-white">
              Terms of service
            </Link>
            <Link to="/privacy" className="hover:text-white">
              Privacy policy
            </Link>
          </div>
          <p className="text-xs text-gray-500">
            Copyright {year} Connectify. All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
