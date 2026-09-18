import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../context/authContext/useAuth";
import PasswordInput from "../../components/auth/PasswordInput";
import { SparkleIcon, UsersIcon } from "lucide-react";
import { MessageIcon } from "../../components/auth/Icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  type RegisterInput,
} from "../../../../../packages/shared/src/schemas/auth";
import { useState, useRef } from "react";
import { themedToast } from "../../utils/ToastFeedback";
import axios from "axios";

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, googleLogin } = useAuth();

  const [signupError, setSignupError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const googleContainerRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors,isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const submit = async (data: RegisterInput) => {
  if (isLoading) return;

  try {
    setIsLoading(true);
    setSignupError("");

    await signup(data.fullName, data.email, data.password);

    themedToast.success("Account created successfully!");

    navigate("/verify-email", {
      state: { email: data.email },
    });
  } catch (error) {
    console.error("User not Created", error);

   let message = '';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.error?.message 
      } else if (error instanceof Error) {
        message = error.message;
      }

    setSignupError(message);
    themedToast.error(message);
  } finally {
    setIsLoading(false);
  }
};

  const handleGoogleLogin = () => {
    setSignupError("");

    const googleButton =
      googleContainerRef.current?.querySelector(
        'div[role="button"]',
      ) as HTMLElement | null;

    if (!googleButton) {
      setSignupError("Google authentication is still loading. Please try again.");
      return;
    }

    googleButton.click();
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-8 py-10 sm:py-12 bg-white">
        <div className="w-full max-w-110">
          <h1 className="text-2xl font-bold font-serif text-gray-900 mb-7">
            Connectify
          </h1>

          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 mb-2">
            Create your account
          </h2>

          <p className="text-sm sm:text-base text-gray-500 mb-7">
            Join thousands of people finding real connections on Connectify.
          </p>

          <form onSubmit={handleSubmit(submit)} noValidate>
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g John Doe"
              {...register("fullName")}
            />

            {errors.fullName && (
              <h1 className="text-red-500">
                {errors.fullName.message}
              </h1>
            )}

            <Input
              label="Email address"
              type="email"
              placeholder="name@gmail.com"
              {...register("email")}
            />

            {errors.email && (
              <h1 className="text-red-500">
                {errors.email.message}
              </h1>
            )}

            <PasswordInput
              label="Password"
              type="password"
              placeholder="******"
              {...register("password")}
            />

            {errors.password && (
              <h1 className="text-red-500">
                {errors.password.message}
              </h1>
            )}

            {signupError && (
              <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {signupError}
              </p>
            )}

            <Button
            className="w-full"
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            >
           {isSubmitting ? 'Creating account...' : 'Create Account'}
           </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs font-semibold tracking-wide text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />
            OR
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          {/* GOOGLE LOGIN */}
          <div className="relative h-12 w-full">

          
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="absolute inset-0 z-0 flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white text-[15px] font-semibold text-gray-900 transition hover:bg-gray-50"
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="h-5 w-5"
              />

              <span>Continue with Google</span>
            </button>

            {/* GOOGLE AUTH BUTTON */}
            <div
              ref={googleContainerRef}
              className="absolute left-0 top-0 z-10 h-12 w-full overflow-hidden opacity-0"
            >
              <GoogleLogin
                width="100%"
                onSuccess={async (credentialResponse) => {
                  try {
                    if (!credentialResponse.credential) {
                      throw new Error(
                        "Google did not return an ID token.",
                      );
                    }

                    await googleLogin(
                      credentialResponse.credential,
                    );

                    themedToast.success("Google sign-in successful!");

                    navigate("/");
                  } catch (error) {
                    console.error(
                      "Google login failed:",
                      error,
                    );

                    const message =
                         error instanceof Error
                               ? error.message
                               : "Google login failed. Please try again.";

                          setSignupError(message);
                          themedToast.error(message);
                      }
                      }}
                    onError={() => {
                        const message = "Google login failed. Please try again.";

                        setSignupError(message);
                        themedToast.error(message);
                     }}
              />
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#6B30CE] hover:text-[#5F2AB8] hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="relative hidden overflow-hidden bg-linear-to-br from-[#7B39EA] via-[#6B30CE] to-[#5423A6] lg:flex lg:w-1/2">

        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

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

export default SignupPage;