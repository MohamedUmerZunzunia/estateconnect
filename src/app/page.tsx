"use client";

import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-[#f7f8f6] text-[#202a24]">
      <header className="border-b border-[#e6e9e4] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#174b38] text-xl font-bold text-white">
              E
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight">
                EstateConnect
              </span>
              <span className="block text-xs text-gray-500">
                Your world of real estate
              </span>
            </span>
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-[#174b38] px-5 py-2.5 text-sm font-semibold text-[#174b38] transition hover:bg-[#edf3ed]"
          >
            Log in
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:py-24 lg:grid-cols-2 lg:py-28">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#edf3ed] px-4 py-2 text-sm font-medium text-[#47745b]">
            <span className="h-2 w-2 rounded-full bg-[#6b9c72]" />
            A global network for real estate professionals
          </div>

          <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Your next great{" "}
            <span className="text-[#47745b]">connection</span> could be
            anywhere.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
            Meet real estate professionals, discover property opportunities,
            and build trusted relationships across markets and borders.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-[#174b38] px-7 py-4 font-semibold text-white shadow-sm transition hover:bg-[#103b2b]"
            >
              Join EstateConnect
              <span className="ml-2" aria-hidden="true">→</span>
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-7 py-4 font-semibold text-[#202a24] transition hover:border-[#174b38]"
            >
              I'm already a member
            </Link>
          </div>

          <p className="mt-5 text-sm text-gray-500">
            Built for collaboration, referrals, and international growth.
          </p>
        </div>

        <div className="rounded-3xl border border-[#e2e9e1] bg-[#e8eee8] p-5 sm:p-8">
          <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#47745b]">
              Meet. Connect. Grow.
            </p>

            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
              A world of opportunity, within reach.
            </h2>

            <div className="mt-7 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#f7f8f6] p-5">
                <span className="text-3xl" aria-hidden="true">🏙️</span>
                <h3 className="mt-4 font-semibold">Global connections</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Meet professionals in new cities and markets.
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f8f6] p-5">
                <span className="text-3xl" aria-hidden="true">🤝</span>
                <h3 className="mt-4 font-semibold">Trusted partners</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Build relationships that support your business.
                </p>
              </div>

              <div className="col-span-2 rounded-2xl bg-[#174b38] p-6 text-white">
                <p className="text-sm text-white/70">
                  YOUR PROFESSIONAL COMMUNITY
                </p>
                <p className="mt-2 text-xl font-medium leading-7">
                  One introduction can open the door to a new market.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e6e9e4] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-[#174b38]">EstateConnect</p>
          <p>Building a more connected real estate world.</p>
        </div>
      </footer>
    </main>
  );
}