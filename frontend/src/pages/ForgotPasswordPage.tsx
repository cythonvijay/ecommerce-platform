import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="font-display mb-1 text-xl font-bold text-ink-900 dark:text-white">Forgot password</h1>
      <p className="mb-6 text-sm text-ink-500 dark:text-ink-400">
        Self-service password reset isn&apos;t wired up in this build yet. If you already know your current password,
        you can change it from your profile once signed in.
      </p>
      <Link to="/login" className="btn-secondary w-full">Back to sign in</Link>
    </div>
  );
}
