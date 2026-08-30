import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* Authentication section */}
      <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
        <div className="w-full max-w-md">{children}</div>
      </section>

      {/* Connectify branding section */}
      <section className="hidden min-h-screen bg-purple-600 lg:flex lg:items-center lg:justify-center px-10">
        <div className="max-w-md text-center text-white">
          <h2 className="text-4xl font-bold">Connect with people.</h2>

          <p className="mt-4 text-lg leading-8 text-purple-100">
            Build meaningful connections and discover people who share your
            interests.
          </p>
        </div>
      </section>
    </main>
  );
};

export default AuthLayout;
