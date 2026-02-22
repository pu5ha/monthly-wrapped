"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Wrap } from "@/types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface WrapHistoryProps {
  wraps: Wrap[];
}

export default function WrapHistory({ wraps }: WrapHistoryProps) {
  if (wraps.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
        <p className="text-lg text-white/50">No wraps yet.</p>
        <p className="mt-2 text-sm text-white/30">
          Generate your first Monthly Wrapped above!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {wraps.map((wrap, i) => (
        <motion.div
          key={wrap.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Link
            href={`/wrap/${wrap.id}`}
            className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-[#1DB954]/50 hover:bg-white/10"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={wrap.image_url}
                alt={`${MONTH_NAMES[wrap.month - 1]} ${wrap.year} Wrapped`}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold">
                {MONTH_NAMES[wrap.month - 1]} {wrap.year}
              </h3>
              <p className="mt-1 text-sm text-white/50">
                {wrap.top_artists[0]?.name} &middot; {wrap.top_tracks[0]?.name}
              </p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
