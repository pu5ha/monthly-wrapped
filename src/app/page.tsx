"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "@/lib/useSession";
import SpotifyLoginButton from "@/components/SpotifyLoginButton";
import Navbar from "@/components/Navbar";

export default function Home() {
  const { user, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1DB954] border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
        {/* Background gradient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#1DB954]/20 blur-[150px]" />
          <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-purple-600/20 blur-[150px]" />
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/10 blur-[120px]" />
        </div>

        <motion.div
          className="relative z-10 mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1DB954] to-emerald-600 shadow-[0_0_60px_rgba(29,185,84,0.3)]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <span className="text-3xl font-black text-black">M</span>
          </motion.div>

          <motion.h1
            className="mb-4 text-5xl font-black tracking-tight sm:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Monthly{" "}
            <span className="bg-gradient-to-r from-[#1DB954] via-emerald-400 to-[#1DB954] bg-clip-text text-transparent">
              Wrapped
            </span>
          </motion.h1>

          <motion.p
            className="mb-10 text-lg text-white/60 sm:text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Why wait until the end of the year? Get your top 5 songs
            and artists as a shareable image — every single month.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <SpotifyLoginButton />
          </motion.div>

          <motion.p
            className="mt-6 text-xs text-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            Free &middot; Generates in the first week of every month
          </motion.p>
        </motion.div>
      </main>
    </>
  );
}
