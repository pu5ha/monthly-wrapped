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
  const [igFeedback, setIgFeedback] = useState(false);
  const [imgurUrl, setImgurUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/wrap/${wrapId}`;
  const shareText = `Check out my ${month} ${year} Wrapped! #MonthlyWrapped`;
  const filename = `${month.toLowerCase()}-${year}-wrapped.png`;

  const fetchImageBlob = async () => {
    const response = await fetch(imageUrl);
    return response.blob();
  };

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async () => {
    try {
      const blob = await fetchImageBlob();
      downloadBlob(blob);
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  // Upload image to Imgur, then open X tweet compose with the Imgur link
  // so X auto-embeds the image as a card
  const handleTwitter = async () => {
    let tweetUrl = shareUrl;

    if (imgurUrl) {
      tweetUrl = imgurUrl;
    } else {
      try {
        setUploading(true);
        const res = await fetch("/api/imgur", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl }),
        });
        if (res.ok) {
          const { link } = await res.json();
          setImgurUrl(link);
          tweetUrl = link;
        }
      } catch {
        // fall back to shareUrl
      } finally {
        setUploading(false);
      }
    }

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(tweetUrl)}`;
    window.open(url, "_blank", "width=550,height=420");
  };

  // Mobile: Web Share API with actual image file (opens native share sheet)
  // Desktop: download + instructions
  const handleInstagram = async () => {
    try {
      const blob = await fetchImageBlob();
      const file = new File([blob], filename, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        return;
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
    }

    // Fallback: download the image + show feedback
    await handleDownload();
    setIgFeedback(true);
    setTimeout(() => setIgFeedback(false), 3000);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium transition hover:bg-white/20"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download
      </button>

      <button
        onClick={handleTwitter}
        disabled={uploading}
        className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium transition hover:bg-white/20 disabled:opacity-50"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        {uploading ? "Uploading..." : "Share on X"}
      </button>

      <button
        onClick={handleInstagram}
        className="flex items-center gap-2 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 px-5 py-2.5 text-sm font-medium transition hover:opacity-80"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.43.403a4.088 4.088 0 011.47.958c.453.453.773.898.958 1.47.163.46.349 1.26.404 2.43.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.055 1.17-.241 1.97-.404 2.43a4.088 4.088 0 01-.958 1.47 4.088 4.088 0 01-1.47.958c-.46.163-1.26.349-2.43.404-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.055-1.97-.241-2.43-.404a4.088 4.088 0 01-1.47-.958 4.088 4.088 0 01-.958-1.47c-.163-.46-.349-1.26-.404-2.43C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.055-1.17.241-1.97.404-2.43a4.088 4.088 0 01.958-1.47 4.088 4.088 0 011.47-.958c.46-.163 1.26-.349 2.43-.404C8.416 2.175 8.796 2.163 12 2.163M12 0C8.741 0 8.333.014 7.053.072 5.775.131 4.902.333 4.14.63a5.876 5.876 0 00-2.126 1.384A5.876 5.876 0 00.63 4.14C.333 4.902.131 5.775.072 7.053.014 8.333 0 8.741 0 12s.014 3.667.072 4.947c.059 1.278.261 2.151.558 2.913a5.876 5.876 0 001.384 2.126A5.876 5.876 0 004.14 23.37c.762.297 1.635.499 2.913.558C8.333 23.986 8.741 24 12 24s3.667-.014 4.947-.072c1.278-.059 2.151-.261 2.913-.558a5.876 5.876 0 002.126-1.384 5.876 5.876 0 001.384-2.126c.297-.762.499-1.635.558-2.913.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.059-1.278-.261-2.151-.558-2.913a5.876 5.876 0 00-1.384-2.126A5.876 5.876 0 0019.86.63c-.762-.297-1.635-.499-2.913-.558C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
        {igFeedback ? "Image saved! Open Instagram" : "Share to Instagram"}
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
  );
}
