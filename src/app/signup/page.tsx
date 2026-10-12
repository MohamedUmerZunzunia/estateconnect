"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function signUp() {
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data.session) {
        router.push("/profile-setup");
      } else {
        setMessage(
          "Account created. Check your email to confirm your account, then log in."
        );
      }
    } catch {
      setMessage("Could not connect to the service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8f6] px-5 py-10 text-[#202a24]">
      <div className="w-full max-w-md rounded-2xl border border-[#e6e9e4] bg-white p-8 shadow-sm">
        <Link
          href="/"
          className="text-sm font-medium text-[#47745b] hover:underline"
        >
          ← EstateConnect
        </Link>

        <div className="mt-6 mb-7">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#174b38] text-xl font-bold text-white">
            E
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Join EstateConnect
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Create your professional account and connect with real estate
            professionals around the world.
          </p>
        </div>

        <label htmlFor="signup-email" className="mb-1 block text-sm font-medium">
          Work email
        </label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          className="mb-5 w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-[#47745b]"
          required
        />

        <label
          htmlFor="signup-password"
          className="mb-1 block text-sm font-medium"
        >
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Create a password"
          className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-[#47745b]"
          required
        />

        <button
          type="button"
          onClick={signUp}
          disabled={loading || !email.trim() || !password}
          className="mt-6 w-full rounded-xl bg-[#174b38] px-5 py-3 font-medium text-white hover:bg-[#103b2b] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        {message && (
          <p className="mt-4 break-words text-sm text-gray-600" role="status">
            {message}
          </p>
        )}

        <p className="mt-6 border-t border-gray-100 pt-5 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#174b38] hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}