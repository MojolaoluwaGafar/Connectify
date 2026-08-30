import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import {
  SparkleIcon,
  UsersIcon,
  MessageIcon,
} from '../../components/auth/Icons';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || '');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    resetCode?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (!email.trim() || !email.includes('@')) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (!resetCode.trim()) {
      newErrors.resetCode = 'Enter the reset code from your email.';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'Password must be at least 8 characters.';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters.';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password.';
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      navigate('/login', {
        state: {
          passwordReset: true,
        },
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* =========================
          LEFT SIDE - FORM
      ========================== */}

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-8 py-10 sm:py-12 bg-white">
        <div className="w-full max-w-110">
          {/* Logo */}

          <h1 className="text-2xl font-bold font-serif text-gray-900 mb-7">
            Connectify
          </h1>

          {/* Heading */}

          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 mb-2">
            Reset your password
          </h2>

          <p className="text-sm sm:text-base text-gray-500 mb-7">
            Enter the reset code we sent you along with your new password.
          </p>

          {/* Form */}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email address */}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900 mb-1.5"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);

                  setErrors((current) => ({
                    ...current,
                    email: undefined,
                  }));
                }}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.email ? 'border-red-400' : 'border-gray-200'
                }`}
              />

              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Reset code */}

            <div>
              <label
                htmlFor="resetCode"
                className="block text-sm font-medium text-gray-900 mb-1.5"
              >
                Reset code
              </label>

              <input
                id="resetCode"
                type="text"
                value={resetCode}
                onChange={(e) => {
                  setResetCode(e.target.value);

                  setErrors((current) => ({
                    ...current,
                    resetCode: undefined,
                  }));
                }}
                placeholder="Paste the code from your email"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.resetCode ? 'border-red-400' : 'border-gray-200'
                }`}
              />

              {errors.resetCode && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.resetCode}
                </p>
              )}
            </div>

            {/* New password */}

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-900 mb-1.5"
              >
                New password
              </label>

              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);

                    setErrors((current) => ({
                      ...current,
                      newPassword: undefined,
                    }));
                  }}
                  placeholder="At least 8 characters"
                  className={`w-full px-4 py-2.5 pr-11 border rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    newPassword ? 'bg-blue-50/50' : 'bg-white'
                  } ${
                    errors.newPassword ? 'border-red-400' : 'border-gray-200'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.75C2.73 10.1 2 11.64 2 12s3.5 7 10 7c1.52 0 2.87-.27 4.05-.7M6.1 5.1C7.7 4.1 9.65 3.5 12 3.5c6.5 0 10 7 10 7s-.73 1.9-2.04 3.22M9.88 9.88a3 3 0 1 0 4.24 4.24M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {errors.newPassword && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm new password */}

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-900 mb-1.5"
              >
                Confirm new password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);

                    setErrors((current) => ({
                      ...current,
                      confirmPassword: undefined,
                    }));
                  }}
                  className={`w-full px-4 py-2.5 pr-11 border rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.confirmPassword
                      ? 'border-red-400'
                      : 'border-gray-200'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.75C2.73 10.1 2 11.64 2 12s3.5 7 10 7c1.52 0 2.87-.27 4.05-.7M6.1 5.1C7.7 4.1 9.65 3.5 12 3.5c6.5 0 10 7 10 7s-.73 1.9-2.04 3.22M9.88 9.88a3 3 0 1 0 4.24 4.24M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Reset password button */}

            <button
              type="submit"
              className="w-full bg-[#6B30CE] hover:bg-[#5F2AB8] text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm shadow-purple-300"
            >
              Reset password
            </button>

            {/* Back to login */}

            <div className="text-center pt-1">
              <Link
                to="/login"
                className=" text-[#6B30CE] hover:text-[#5F2AB8] font-medium hover:underline"
              >
                Back to login
              </Link>
            </div>
          </form>
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

          {/* Feature 1 */}

          <div className="space-y-5">
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

export default ResetPasswordPage;
