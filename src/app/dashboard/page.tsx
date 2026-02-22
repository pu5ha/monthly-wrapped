"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useSession } from "@/lib/useSession";
import Navbar from "@/components/Navbar";
import LoadingAnimation from "@/components/LoadingAnimation";
import WrapHistory from "@/components/WrapHistory";
import type { Wrap, SpotifyTrack, SpotifyArtist } from "@/types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Dashboard() {
  const { user, status } = useSession();
  const router = useRouter();
  const [wraps, setWraps] = useState<Wrap[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topItems, setTopItems] = useState<{ topTracks: SpotifyTrack[]; topArtists: SpotifyArtist[] } | null>(null);
  const [fetchingTop, setFetchingTop] = useState(false);

  const now = new Date();
  const isFirstWeek = now.getDate() <= 7 || process.env.NEXT_PUBLIC_TEST_MODE === "true";
  const wrapMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const wrapYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const wrapMonthName = MONTH_NAMES[wrapMonth - 1];

  const fetchWraps = useCallback(async () => {
    try {
      const res = await fetch("/api/wraps");
      if (res.ok) {
        const data = await res.json();
        setWraps(data.wraps ?? []);
      }
    } catch {
      // Wraps will just be empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchWraps();
    }
  }, [status, router, fetchWraps]);

  const alreadyGenerated = wraps.some(
    (w) => w.month === wrapMonth && w.year === wrapYear
  );

  const handleGenerate = async (force = false) => {
    setGenerating(true);
    setError(null);

    try {
      const url = force ? "/api/generate?force=true" : "/api/generate";
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setGenerating(false);
        return;
      }

      router.push(`/wrap/${data.wrap.id}`);
    } catch {
      setError("Failed to generate. Please try again.");
      setGenerating(false);
    }
  };

  const handleFetchTopItems = async () => {
    setFetchingTop(true);
    setError(null);
    try {
      const res = await fetch("/api/spotify/top-items");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to fetch top items");
        return;
      }
      setTopItems(data);
    } catch {
      setError("Failed to fetch top items.");
    } finally {
      setFetchingTop(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center pt-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1DB954] border-t-transparent" />
        </main>
      </>
    );
  }

  if (generating) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center pt-16">
          <LoadingAnimation />
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-24">
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 sm:p-12">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-black sm:text-4xl">
                  {isFirstWeek ? (
                    <>
                      {wrapMonthName}{" "}
                      <span className="bg-gradient-to-r from-[#1DB954] to-emerald-400 bg-clip-text text-transparent">
                        Wrapped
                      </span>{" "}
                      is ready
                    </>
                  ) : (
                    "Your Dashboard"
                  )}
                </h1>
                <p className="mt-2 text-white/50">
                  {isFirstWeek && !alreadyGenerated
                    ? `Generate your top 5 songs and artists from ${wrapMonthName} ${wrapYear}.`
                    : isFirstWeek && alreadyGenerated
                      ? `You already generated your ${wrapMonthName} wrap! Check it out below.`
                      : `Come back in the first week of ${MONTH_NAMES[now.getMonth() === 11 ? 0 : now.getMonth() + 1]} to generate your next wrap.`}
                </p>
              </div>

              {isFirstWeek && !alreadyGenerated && (
                <button
                  onClick={() => handleGenerate()}
                  className="shrink-0 rounded-full bg-[#1DB954] px-8 py-3 font-bold text-black transition hover:scale-105 hover:shadow-[0_0_30px_rgba(29,185,84,0.3)]"
                >
                  Generate My Wrapped
                </button>
              )}

              {isFirstWeek && alreadyGenerated && (
                <button
                  onClick={() => handleGenerate(true)}
                  className="shrink-0 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white/70 transition hover:bg-white/10"
                >
                  Regenerate
                </button>
              )}

              {!isFirstWeek && (
                <div className="shrink-0 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-white/40">
                  Available in {(() => {
                    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                    const diff = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    return `${diff} days`;
                  })()}
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}
          </div>
        </motion.section>

        {/* Test: Fetch Top Items */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Test: Fetch Top Items</h2>
              <button
                onClick={handleFetchTopItems}
                disabled={fetchingTop}
                className="rounded-full bg-purple-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-purple-500 disabled:opacity-50"
              >
                {fetchingTop ? "Fetching..." : "Fetch My Top 5"}
              </button>
            </div>

            {topItems && (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-[#1DB954]">Top Songs</h3>
                  <ol className="space-y-3">
                    {topItems.topTracks.slice(0, 5).map((track, i) => (
                      <li key={track.id} className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                          {i + 1}
                        </span>
                        {track.album.images[0] && (
                          <img src={track.album.images[0].url} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium">{track.name}</p>
                          <p className="truncate text-sm text-white/50">{track.artists.map(a => a.name).join(", ")}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-[#1DB954]">Top Artists</h3>
                  <ol className="space-y-3">
                    {topItems.topArtists.slice(0, 5).map((artist, i) => (
                      <li key={artist.id} className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                          {i + 1}
                        </span>
                        {artist.images[0] && (
                          <img src={artist.images[0].url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                        )}
                        <p className="truncate font-medium">{artist.name}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="mb-6 text-2xl font-bold">Your Wraps</h2>
          <WrapHistory wraps={wraps} />
        </motion.section>
      </main>
    </>
  );
}
