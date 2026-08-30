import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import {
  SparkleIcon,
  UsersIcon,
  MessageIcon,
} from '../../components/auth/Icons';

const CheckEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || 'your email address';

  const [resetCode, setResetCode] = useState('');

  useEffect(() => {
    const generatedCode = String(Math.floor(100000 + Math.random() * 900000));

    setResetCode(generatedCode);

    console.log(
      '%c[Connectify Dev] Mock reset code:',
      'color:#7c3aed;font-weight:bold;',
      generatedCode,
    );
  }, []);

  const handleResetCode = () => {
    navigate('/reset-password', {
      state: {
        email,
        resetCode,
      },
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* =========================
          LEFT SIDE - CHECK EMAIL
      ========================== */}

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-8 py-10 sm:py-12 bg-white">
        <div className="w-full max-w-110">
          {/* Logo */}

          <h1 className="text-2xl font-bold font-serif text-gray-900 mb-7">
            Connectify
          </h1>

          {/* Key icon */}

          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-violet-600"
            >
              <circle cx="7.5" cy="15.5" r="5.5" />
              <path d="m21 2-9.6 9.6" />
              <path d="m15.5 7.5 3 3" />
              <path d="m18.5 4.5 1 1" />
            </svg>
          </div>

          {/* Heading */}

          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 mb-2">
            Check your email
          </h2>

          {/* Description */}

          <p className="text-sm sm:text-base text-gray-500 mb-6 leading-relaxed">
            If an account exists for{' '}
            <span className="font-semibold text-gray-900">{email}</span>, we've
            sent a link to reset your password.
          </p>

          {/* Dev note */}

          <div className="mb-7 rounded-lg border border-violet-100 bg-violet-50 px-4 py-3">
            <p className="text-sm leading-relaxed text-violet-700">
              Dev note: the reset token was logged to the console — this mock
              has no real inbox to send it to.
            </p>
          </div>

          {/* Reset code button */}

          <button
            type="button"
            onClick={handleResetCode}
            className="w-full bg-[#6B30CE] hover:bg-[#5F2AB8] text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm shadow-purple-300"
          >
            I have my reset code
          </button>

          {/* Back to login */}

          <div className="text-center pt-3">
            <Link
              to="/login"
              className=" text-[#6B30CE] hover:text-[#5F2AB8] font-medium hover:underline"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>

      {/* =========================
          RIGHT SIDE - PROMO PANEL
      ========================== */}

      <div className="relative hidden overflow-hidden bg-linear-to-br from-[#7B39EA] via-[#6B30CE] to-[#5423A6] lg:flex lg:w-1/2">
        {/* White dotted pattern */}

        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Promo content */}

        <div className="relative z-10 flex flex-col justify-center px-12 py-12 text-white">
          {/* Sparkle icon */}

          <div className="mb-7">
            <SparkleIcon size={32} />
          </div>

          {/* Heading */}

          <h2 className="mb-5 font-serif text-3xl font-bold leading-tight">
            Real connections,
            <br />
            real people.
          </h2>

          {/* Description */}

          <p className="mb-9 max-w-md text-base leading-relaxed text-purple-100">
            Join thousands of people who found genuine friendships and
            relationships built around shared interests.
          </p>

          {/* Features */}

          <div className="space-y-5">
            {/* Feature 1 */}

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                <UsersIcon size={20} />
              </div>

              <span className="text-sm text-purple-50">
                Match with people who share your passions
              </span>
            </div>

            {/* Feature 2 */}

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                <MessageIcon size={20} />
              </div>

              <span className="text-sm text-purple-50">
                Start real conversations, not small talk
              </span>
            </div>

            {/* Feature 3 */}

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                <SparkleIcon size={20} />
              </div>

              <span className="text-sm text-purple-50">
                Discover people near you and around the world
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckEmailPage;
