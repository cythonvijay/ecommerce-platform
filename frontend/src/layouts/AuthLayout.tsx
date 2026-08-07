import { Link, Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 dark:bg-ink-950">
      <div className="w-full max-w-md">
        <Link to="/" className="font-display mb-8 block text-center text-2xl font-bold text-ink-900 dark:text-white">
          Market<span className="text-amber-500">place</span>
        </Link>
        <div className="card p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
