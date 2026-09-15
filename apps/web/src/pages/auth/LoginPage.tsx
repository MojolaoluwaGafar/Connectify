import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GoogleLogin } from '@react-oauth/google';

import {
  loginSchema,
  type LoginInput,
} from '../../../../../packages/shared/src/schemas/auth';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

import { useAuth } from '../../context/authContext/useAuth';
import { SparkleIcon, UsersIcon } from 'lucide-react';
import { MessageIcon } from '../../components/auth/Icons';
import PasswordInput from '../../components/auth/PasswordInput';

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { login, googleLogin } = useAuth();

  const [loginError, setLoginError] = useState('');

  const googleLoginRef = useRef<HTMLDivElement>(null);

  const showVerifiedMessage = location.state?.verified === true;

  const showPasswordResetMessage =
    location.state?.passwordReset === true;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const submit = async (data: LoginInput) => {
    try {
      setLoginError('');

      await login(data.email, data.password);

      navigate('/home', { replace: true });
    } catch (error) {
      setLoginError(
        error instanceof Error
          ? error.message
          : 'Incorrect email or password.',
      );
    }
  };

  const handleGoogleLogin = () => {
    const googleButton = googleLoginRef.current?.querySelector(
      'div[role="button"]',
    ) as HTMLElement | null;

    googleButton?.click();
  };

  return (
    <div className="min-h-screen flex">
      {/* =========================
          LEFT SIDE - LOGIN FORM
      ========================== */}

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-8 py-10 sm:py-12 bg-white">
        <div className="w-full max-w-110">

          {/* Logo */}

          <h1 className="text-2xl font-bold font-serif text-gray-900 mb-7">
            Connectify
          </h1>

          {/* Heading */}

          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 mb-2">
            Welcome back
          </h2>

          <p className="text-sm sm:text-base text-gray-500 mb-7">
            Sign in to continue
          </p>

          {/* Email verified notification */}

          {showVerifiedMessage && (
            <div className="mb-7 rounded-lg border border-green-100 bg-green-50 px-4 py-3">
              <p className="text-sm font-medium text-green-700">
                Email verified! You can now log in.
              </p>
            </div>
          )}

          {/* Password reset notification */}

          {showPasswordResetMessage && (
            <div className="mb-7 rounded-lg border border-green-100 bg-green-50 px-4 py-3">
              <p className="text-sm font-medium text-green-700">
                Password reset successful! You can now log in.
              </p>
            </div>
          )}

          {/* Login form */}

          <form onSubmit={handleSubmit(submit)} noValidate>

            {/* API error */}

            {loginError && (
              <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {loginError}
              </p>
            )}

            {/* Email */}

            <Input
              label="Email address"
              type="email"
              placeholder="name@gmail.com"
              {...register('email')}
              error={errors.email?.message}
            />

            {/* Password */}

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              {...register('password')}
              error={errors.password?.message}
            />

            {/* Forgot password */}

            <div className="mb-7 flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-[#6B30CE] hover:text-[#5F2AB8] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Continue button */}

            <Button
              type="submit"
              className="w-full bg-[#6B30CE] hover:bg-[#5F2AB8]"
            >
              Continue
            </Button>
          </form>

          {/* OR divider */}

          <div className="my-7 flex items-center gap-3 text-xs font-semibold tracking-wide text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />
            OR
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Google button */}

          <div className="relative h-12 w-full">

            {/* Your custom Google button */}

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="absolute inset-0 z-0 flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white text-[15px] font-semibold text-gray-900 transition hover:bg-gray-50"
            >
              <img
                src="/material-icon-theme_google.svg"
                alt="Google"
                className="h-5 w-5"
              />

              <span>Continue with Google</span>
            </button>

            {/* Invisible Google Login component */}

            <div
              ref={googleLoginRef}
              className="absolute inset-0 z-10 h-12 w-full opacity-0"
            >
              <GoogleLogin
                width="100%"
                onSuccess={async (credentialResponse) => {
                  try {
                    setLoginError('');

                    if (!credentialResponse.credential) {
                      throw new Error(
                        'Google did not return an ID token.',
                      );
                    }

                    await googleLogin(
                      credentialResponse.credential,
                    );

                    navigate('/home', {
                      replace: true,
                    });
                  } catch (error) {
                    console.error(
                      'Google login failed:',
                      error,
                    );

                    setLoginError(
                      error instanceof Error
                        ? error.message
                        : 'Google login failed. Please try again.',
                    );
                  }
                }}
                onError={() => {
                  setLoginError(
                    'Google login failed. Please try again.',
                  );
                }}
              />
            </div>
          </div>

          {/* Sign up */}

          <p className="mt-7 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-[#6B30CE] hover:text-[#5F2AB8] hover:underline"
            >
              Sign up
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

export default LoginPage;