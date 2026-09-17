import { SparkleIcon, UsersIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageIcon } from '../../components/auth/Icons';

import { useAuth } from '../../context/authContext/useAuth';
import { themedToast } from '../../utils/ToastFeedback';

const VerifyEmailPage = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { verifyEmail, resendVerificationCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || '';

  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);

  const [error, setError] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);

    const updatedCode = [...code];
    updatedCode[index] = digit;

    setCode(updatedCode);
    setError('');

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pastedCode = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);

    if (!pastedCode) {
      return;
    }

    const updatedCode = ['', '', '', '', '', ''];

    pastedCode.split('').forEach((digit, index) => {
      updatedCode[index] = digit;
    });

    setCode(updatedCode);
    setError('');

    const focusIndex = Math.min(pastedCode.length, 5);

    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (
  event: React.FormEvent<HTMLFormElement>,
) => {
  event.preventDefault();

  const enteredCode = code.join('');

  if (enteredCode.length < 6) {
    setError('Please enter the 6-digit verification code.');

    themedToast.error('Please enter the 6-digit verification code.');

    return;
  }

  if (isVerifying) return;

  setIsVerifying(true);
  setError('');

  try {
    await verifyEmail(email, enteredCode);

    themedToast.success('Email verified successfully!');

    navigate('/login', {
      state: { verified: true },
    });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Invalid verification code. Please try again.';

    setError(message);

    themedToast.error(message);

    setCode(['', '', '', '', '', '']);

    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 0);
  } finally {
    setIsVerifying(false);
  }
};

  const handleResend = async (
  event: React.MouseEvent<HTMLButtonElement>,
) => {
  event.preventDefault();

  if (isResending) return;

  setIsResending(true);
  setError('');

  try {
    await resendVerificationCode(email);

    setCode(['', '', '', '', '', '']);

    themedToast.success('A new verification code has been sent.');

    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 0);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Could not resend the verification code.';

    setError(message);

    themedToast.error(message);
  } finally {
    setIsResending(false);
  }
};
  return (
    <div className="min-h-screen flex">
      {/* =========================
          LEFT SIDE - VERIFY EMAIL
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
            Verify your email
          </h2>

          {/* Description */}

          <p className="text-sm sm:text-base text-gray-500 mb-6 leading-relaxed">
            We sent a 6-digit code to{' '}
            <span className="font-semibold text-gray-900">
              {email || 'your email address'}
            </span>
            . Enter it below to activate your account.
          </p>

          {/* Dev note */}

          <div className="mb-7 rounded-lg border border-violet-100 bg-violet-50 px-4 py-3">
            <p className="text-sm leading-relaxed text-violet-600">
              Dev note: check your browser console for the verification code.
            </p>
          </div>

          {/* OTP form */}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-6 flex gap-2 sm:gap-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  autoComplete="one-time-code"
                  onChange={(event) => handleChange(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={handlePaste}
                  aria-label={`Verification digit ${index + 1}`}
                  className={`aspect-square min-w-0 flex-1 rounded-lg border-2 text-center text-xl font-bold text-gray-900 outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-200 ${
                    error ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Error */}

            {error && (
              <p className="mb-5 text-sm font-medium text-red-600">{error}</p>
            )}

            {/* Verify button */}

            <button
             type="submit"
             disabled={isVerifying}
             className="w-full bg-[#6B30CE] hover:bg-[#5F2AB8] text-white font-semibold py-2.5 rounded-lg     transition-colors shadow-sm shadow-purple-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
          {isVerifying ? 'Verifying...' : 'Verify email'}
          </button>
          </form>

          {/* Resend */}

          <p className="mt-6 text-center text-sm text-gray-500">
            Didn't get a code?{' '}
            <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="font-medium text-[#6B30CE] hover:text-[#5F2AB8] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            >
            {isResending ? 'Sending...' : 'Resend code'}
            </button>
          </p>

          {/* Wrong email */}

          <p className="mt-3 text-center text-sm text-gray-500">
            Wrong email?{' '}
            <Link
              to="/signup"
              className="font-medium text-[#6B30CE] hover:text-[#5F2AB8] hover:underline"
            >
              Go back
            </Link>
          </p>
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

export default VerifyEmailPage;
