"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProfileSetupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [headline, setHeadline] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, location, headline, specialty")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setMessage("Could not load your profile: " + error.message);
      } else if (data) {
        setFullName(data.full_name || "");
        setLocation(data.location || "");
        setHeadline(data.headline || "");
        setSpecialty(data.specialty || "");
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function saveProfile() {
    setSaving(true);
    setMessage("");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      const user = authData.user;

      if (authError || !user) {
        setMessage("Please log in again to save your profile.");
        router.replace("/login");
        return;
      }

      if (
        !fullName.trim() ||
        !location.trim() ||
        !headline.trim() ||
        !specialty.trim()
      ) {
        setMessage("Please complete all four fields before continuing.");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            full_name: fullName.trim(),
            location: location.trim(),
            headline: headline.trim(),
            specialty: specialty.trim(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (error) {
        setMessage("Could not save your profile: " + error.message);
        return;
      }

      setMessage("Profile saved! Taking you to EstateConnect...");
      router.push("/dashboard");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8f6] text-[#202a24]">
        Loading your profile...
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8f6] px-5 py-10 text-[#202a24]">
      <div className="w-full max-w-xl rounded-2xl border border-[#e6e9e4] bg-white p-8 shadow-sm">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#174b38] text-xl font-bold text-white">
          E
        </div>

        <p className="text-sm font-medium text-[#47745b]">
          YOUR PROFESSIONAL PROFILE
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Tell us about yourself
        </h1>
        <p className="mt-3 leading-6 text-gray-600">
          Help other real estate professionals understand who you are, where you
          work, and how you can collaborate.
        </p>

        <div className="mt-7 grid gap-5">
          <label className="block text-sm font-medium">
            Full name
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Your full name"
              autoComplete="name"
              className="mt-2 w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-[#47745b]"
              required
            />
          </label>

          <label className="block text-sm font-medium">
            City or country
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="e.g. Vilnius, Lithuania"
              autoComplete="address-level2"
              className="mt-2 w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-[#47745b]"
              required
            />
          </label>

          <label className="block text-sm font-medium">
            Professional headline
            <input
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
              placeholder="e.g. Helping buyers find homes abroad"
              className="mt-2 w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-[#47745b]"
              required
            />
          </label>

          <label className="block text-sm font-medium">
            Area of specialty
            <input
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
              placeholder="e.g. Residential sales or property investment"
              className="mt-2 w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-[#47745b]"
              required
            />
          </label>
        </div>

        {message && (
          <p className="mt-4 text-sm text-gray-600" role="status">
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={saveProfile}
          disabled={saving}
          className="mt-7 w-full rounded-xl bg-[#174b38] px-5 py-3 font-medium text-white hover:bg-[#103b2b] disabled:opacity-50"
        >
          {saving ? "Saving profile..." : "Save profile and continue"}
        </button>

        <p className="mt-4 text-center text-xs text-gray-500">
          Your professional details help members discover and connect with you.
        </p>
      </div>
    </main>
  );
}