"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const payload = await res.json();
        setError(payload.message || "Something went wrong.");
        setIsLoading(false);
        return;
      }

      router.push("/users");
    } catch (err) {
      setError("Network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="panel" style={{ maxWidth: '600px' }}>
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Plus size={20} />
            <h2>Create New Account</h2>
          </div>
        </div>

        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Full Name</span>
            <input
              name="name"
              type="text"
              required
              className="field-input mt-1"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Email Address</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="field-input mt-1"
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="field-input mt-1"
              placeholder="Set a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center items-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-70 transition-all"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
