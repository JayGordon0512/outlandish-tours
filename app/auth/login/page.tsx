"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const registered = params.get("registered");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password
    });
    setLoading(false);
    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4 text-highland-ink">Sign in</h1>
      {registered && (
        <p className="text-xs text-emerald-600 mb-3">
          Account created. You can now sign in.
        </p>
      )}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-highland-offwhite p-6 rounded-2xl border border-highland-stone text-sm"
      >
        <div className="space-y-1">
          <label className="text-sm">Email</label>
          <input
            type="email"
            className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Password</label>
          <input
            type="password"
            className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-highland-gold text-highland-offwhite py-2 text-xs font-semibold hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="text-xs text-highland-ink/70 mt-3">
        No account yet?{" "}
        <Link href="/auth/register" className="text-highland-gold hover:underline">
          Create one here.
        </Link>
      </p>
    </div>
  );
}