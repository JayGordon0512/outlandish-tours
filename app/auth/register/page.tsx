"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to register");
      }
      router.push("/auth/login?registered=1");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4 text-highland-ink">
        Create an account
      </h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-highland-offwhite p-6 rounded-2xl border border-highland-stone text-sm"
      >
        <div className="space-y-1">
          <label className="text-sm">Name</label>
          <input
            className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
        </div>
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
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="text-xs text-highland-ink/70 mt-3">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-highland-gold hover:underline">
          Sign in here.
        </Link>
      </p>
    </div>
  );
}