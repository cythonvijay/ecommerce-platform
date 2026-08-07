import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="font-display text-6xl font-bold text-ink-200 dark:text-ink-800">404</p>
      <h1 className="font-display text-xl font-bold text-ink-900 dark:text-white">Page not found</h1>
      <p className="text-sm text-ink-500 dark:text-ink-400">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-2">Back to home</Link>
    </div>
  );
}
