import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monthly Wrapped — Your Spotify stats, every month",
  description:
    "Why wait until the end of the year? Generate a Spotify Wrapped-style image showing your top 5 songs and artists every month.",
  openGraph: {
    title: "Monthly Wrapped",
    description: "Your Spotify stats, every month.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
