import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { getApiErrorMessage } from "@/lib/format";

export default function RegisterPage() {
  const { register } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-display mb-1 text-xl font-bold text-ink-900 dark:text-white">Create your account</h1>
      <p className="mb-6 text-sm text-ink-500 dark:text-ink-400">Join to start shopping.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Full name" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input label="Password" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" />
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <Button type="submit" isLoading={isLoading} className="w-full">Create account</Button>
      </form>
      <p className="mt-5 text-center text-sm text-ink-500 dark:text-ink-400">
        Already have an account? <Link to="/login" className="font-medium text-amber-600 hover:underline dark:text-amber-400">Sign in</Link>
      </p>
    </div>
  );
}
