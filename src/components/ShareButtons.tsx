"use client";

import { useState } from "react";

interface ShareButtonsProps {
  imageUrl: string;
  wrapId: string;
  month: string;
  year: number;
}

export default function ShareButtons({
  imageUrl,
  wrapId,
  month,
  year,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/wrap/${wrapId}`;
  const filename = `${month.toLowerCase()}-${year}-wrapped.png`;

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-full bg-[#1DB954] px-6 py-2.5 text-sm font-bold text-black transition hover:scale-105 hover:shadow-[0_0_20px_rgba(29,185,84,0.3)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Image
        </button>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium transition hover:bg-white/20"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>

      <p className="text-xs text-white/40">
        Direct upload to X and Instagram coming soon — for now, download and post it!
      </p>
    </div>
  );
}
