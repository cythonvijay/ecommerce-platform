import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { getApiErrorMessage } from "@/lib/format";

export default function LoginPage() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const user = await login({ email, password });
      navigate(user.role === "admin" ? "/admin/dashboard" : from, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-display mb-1 text-xl font-bold text-ink-900 dark:text-white">Welcome back</h1>
      <p className="mb-6 text-sm text-ink-500 dark:text-ink-400">Sign in to continue shopping.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <Button type="submit" isLoading={isLoading} className="w-full">Sign in</Button>
      </form>
      <p className="mt-5 text-center text-sm text-ink-500 dark:text-ink-400">
        Don&apos;t have an account? <Link to="/register" className="font-medium text-amber-600 hover:underline dark:text-amber-400">Create one</Link>
      </p>
      <div className="mt-6 rounded-lg bg-ink-50 p-3 text-xs text-ink-500 dark:bg-ink-800 dark:text-ink-400">
        <p className="font-medium">Demo accounts</p>
        <p>Admin: admin@example.com / Admin@123</p>
        <p>Customer: customer@example.com / Customer@123</p>
      </div>
    </div>
  );
}
