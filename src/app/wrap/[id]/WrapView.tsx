"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import ShareButtons from "@/components/ShareButtons";
import type { Wrap } from "@/types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface WrapViewProps {
  wrap: Wrap;
}

export default function WrapView({ wrap }: WrapViewProps) {
  const monthName = MONTH_NAMES[wrap.month - 1];

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 pb-20 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="mb-2 text-3xl font-black sm:text-4xl">
            {monthName}{" "}
            <span className="bg-gradient-to-r from-[#1DB954] to-emerald-400 bg-clip-text text-transparent">
              Wrapped
            </span>
          </h1>
          <p className="mb-8 text-white/50">{wrap.year}</p>

          {/* The generated image */}
          <motion.div
            className="mx-auto mb-8 max-w-lg overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
          >
            <img
              src={wrap.image_url}
              alt={`${monthName} ${wrap.year} Wrapped`}
              className="w-full"
            />
          </motion.div>

          {/* Share buttons */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <ShareButtons
              imageUrl={wrap.image_url}
              wrapId={wrap.id}
              month={monthName}
              year={wrap.year}
            />
          </motion.div>

          {/* Track & Artist details */}
          <motion.div
            className="mt-12 grid grid-cols-1 gap-8 text-left sm:grid-cols-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {/* Top Songs */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#1DB954]">
                Top Songs
              </h2>
              <ol className="space-y-3">
                {wrap.top_tracks.slice(0, 5).map((track, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{track.name}</p>
                      <p className="truncate text-sm text-white/50">
                        {track.artist}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Top Artists */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#1DB954]">
                Top Artists
              </h2>
              <ol className="space-y-3">
                {wrap.top_artists.slice(0, 5).map((artist, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                      {i + 1}
                    </span>
                    {artist.imageUrl && (
                      <img
                        src={artist.imageUrl}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                    )}
                    <p className="truncate font-medium">{artist.name}</p>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </>
  );
}
