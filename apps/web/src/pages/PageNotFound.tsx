import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function PageNotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Compass size={24} />
      </div>
      <h1 className="mt-5 font-display text-3xl font-semibold text-ink-900">
        Page not found
      </h1>
      <p className="mt-2 text-ink-500">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/" className="mt-6">
        <button>Back to home</button>
      </Link>
    </div>
  );
}
