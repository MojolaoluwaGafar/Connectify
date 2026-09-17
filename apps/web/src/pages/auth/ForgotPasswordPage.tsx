import { SparkleIcon, UsersIcon } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageIcon } from '../../components/auth/Icons';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from '../../../../../packages/shared/src/schemas/auth';

import { useAuth } from '../../context/authContext/useAuth';
import { themedToast } from '../../utils/ToastFeedback';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { requestPasswordReset } = useAuth();

  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const submit = async (data: ForgotPasswordInput) => {
  try {
    setApiError('');

    await requestPasswordReset(data.email);

    themedToast.success('Password reset link sent successfully!');

    navigate('/check-email', {
      state: {
        email: data.email,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Something went wrong. Please try again.';

    setApiError(message);
    themedToast.error(message);
  }
};

  return (
    <div className="min-h-screen flex">
      {/* =========================
          LEFT SIDE - FORGOT PASSWORD
      ========================== */}

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-8 py-10 sm:py-12 bg-white">
        <div className="w-full max-w-110">

          {/* Logo */}

          <h1 className="text-2xl font-bold font-serif text-gray-900 mb-7">
            Connectify
          </h1>

          {/* Heading */}

          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 mb-2">
            Forgot your password?
          </h2>

          {/* Description */}

          <p className="text-sm sm:text-base text-gray-500 mb-7">
            Enter the email linked to your account and we'll send you a link to
            reset it.
          </p>

          {/* Form */}

          <form
            onSubmit={handleSubmit(submit)}
            noValidate
            className="space-y-4"
          >
            {/* API error */}

            {apiError && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {apiError}
              </p>
            )}

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
                placeholder="name@gmail.com"
                autoComplete="email"
                {...register('email')}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.email ? 'border-red-400' : 'border-gray-200'
                }`}
              />

              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Send reset link */}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#6B30CE] hover:bg-[#5F2AB8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm shadow-purple-300"
            >
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          {/* Back to login */}

          <p className="mt-6 text-center text-sm text-gray-500">
            Remembered it?{' '}
            <Link
              to="/login"
              className="font-medium text-[#6B30CE] hover:text-[#5F2AB8] hover:underline"
            >
              Back to login
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

          <div className="mb-7">
            <SparkleIcon size={32} />
          </div>

          <h2 className="mb-5 font-serif text-3xl font-bold leading-tight">
            Real connections,
            <br />
            real people.
          </h2>

          <p className="mb-9 max-w-md text-base leading-relaxed text-purple-100">
            Join thousands of people who found genuine friendships and
            relationships built around shared interests.
          </p>

          <div className="space-y-5">

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                <UsersIcon size={20} />
              </div>

              <span className="text-sm text-purple-50">
                Match with people who share your passions
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                <MessageIcon size={20} />
              </div>

              <span className="text-sm text-purple-50">
                Start real conversations, not small talk
              </span>
            </div>

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

export default ForgotPasswordPage;