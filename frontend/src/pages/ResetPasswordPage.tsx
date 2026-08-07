import { Link } from "react-router-dom";

export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="font-display mb-1 text-xl font-bold text-ink-900 dark:text-white">Reset password</h1>
      <p className="mb-6 text-sm text-ink-500 dark:text-ink-400">
        Email-based reset links aren&apos;t implemented yet. Sign in and use the change password form on your profile page.
      </p>
      <Link to="/login" className="btn-secondary w-full">Back to sign in</Link>
    </div>
  );
}
