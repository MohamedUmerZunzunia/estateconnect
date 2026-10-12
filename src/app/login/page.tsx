
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
      const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function signUp() {
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      setMessage(
        error
          ? error.message
          : "Account created. Check your email if confirmation is required."
      );
    } catch {
      setMessage("Could not connect to the service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function signIn() {
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (!data.user) {
        setMessage("Sign-in succeeded, but no user was returned.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, location, headline, specialty")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) {
        setMessage("Could not check your profile: " + profileError.message);
        return;
      }

      if (
        !profile ||
        !profile.full_name?.trim() ||
        !profile.location?.trim() ||
        !profile.headline?.trim() ||
        !profile.specialty?.trim()
      ) {
        router.push("/profile-setup");
        return;
      }

      router.push("/dashboard");
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
            Welcome back
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Sign in to reconnect with real estate professionals and continue
            growing your network.
          </p>
        </div>

        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          className="mb-5 w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-[#47745b]"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          required
        />

        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-[#47745b]"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
        />

        <button
          type="button"
          className="mt-6 w-full rounded-xl bg-[#174b38] px-5 py-3 font-medium text-white hover:bg-[#103b2b] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={signIn}
          disabled={loading || !email.trim() || !password}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        {message && (
          <p className="mt-4 break-words text-sm text-gray-600" role="status">
            {message}
          </p>
        )}

        <p className="mt-6 border-t border-gray-100 pt-5 text-center text-sm text-gray-600">
          New to EstateConnect?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#174b38] hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}