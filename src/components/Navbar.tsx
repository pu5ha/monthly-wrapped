"use client";

import Link from "next/link";
import { useSession } from "@/lib/useSession";

export default function Navbar() {
  const { user } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#191414]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1DB954]">
            <span className="text-sm font-bold text-black">M</span>
          </div>
          <span className="text-lg font-bold">Monthly Wrapped</span>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-white/70 transition hover:text-white"
            >
              Dashboard
            </Link>
            <div className="flex items-center gap-3">
              {user.image && (
                <img
                  src={user.image}
                  alt=""
                  className="h-8 w-8 rounded-full"
                />
              )}
              <span className="text-sm text-white/70">{user.name}</span>
              <a
                href="/api/auth/logout"
                className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70 transition hover:border-white/40 hover:text-white"
              >
                Sign out
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
