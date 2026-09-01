import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/authContext/useAuth';
import PasswordInput from '../../components/auth/PasswordInput';
import { SparkleIcon, UsersIcon } from 'lucide-react';
import { MessageIcon } from '../../components/auth/Icons';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Enter your full name.';
    }

    if (!email.trim() || !email.includes('@')) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password must be at least 8 characters.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await signup(fullName, email, password);
        // await login(email, password);
        // AuthProvider.login sets user/profile on success — navigate wherever
        // your app takes a logged-in user, e.g.:
        // navigate('/home');
        navigate('/verify-email', { state: { email } });
      } catch (err) {
        setErrors({
          email: err instanceof Error ? err.message : 'Something went wrong.',
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* =========================
          LEFT SIDE - SIGN UP FORM
      ========================== */}

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-8 py-10 sm:py-12 bg-white">
        <div className="w-full max-w-110">
          {/* Logo */}

          <h1 className="text-2xl font-bold font-serif text-gray-900 mb-7">
            Connectify
          </h1>

          {/* Heading */}

          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 mb-2">
            Create your account
          </h2>

          <p className="text-sm sm:text-base text-gray-500 mb-7">
            Join thousands of people finding real connections on Connectify.
          </p>

          {/* Form */}

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}

            <Input
              label="Full Name"
              type="text"
              placeholder="e.g John Doe"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);

                setErrors((current) => ({
                  ...current,
                  fullName: undefined,
                }));
              }}
              error={errors.fullName}
            />

            {/* Email */}

            <Input
              label="Email address"
              type="email"
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);

                setErrors((current) => ({
                  ...current,
                  email: undefined,
                }));
              }}
              error={errors.email}
            />

            {/* Password */}

            <PasswordInput
              label="Password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);

                setErrors((current) => ({
                  ...current,
                  password: undefined,
                }));
              }}
              error={errors.password}
            />

            {/* Create account */}

            <Button
              type="submit"
              className="mt-1.5 w-full bg-[#6B30CE] hover:bg-[#5F2AB8]"
            >
              Create Account
            </Button>
          </form>

          {/* OR divider */}

          <div className="my-6 flex items-center gap-3 text-xs font-semibold tracking-wide text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />
            OR
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Google button */}

          <button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white text-[15px] font-semibold text-gray-900 transition hover:bg-gray-50"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="h-5 w-5"
            />

            <span>Continue with Google</span>
          </button>

          {/* Login link */}

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-[#6B30CE] hover:text-[#5F2AB8] hover:underline"
            >
              Login
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

export default SignupPage;
