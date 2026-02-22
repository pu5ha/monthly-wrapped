import { createSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Wrap } from "@/types";
import WrapView from "./WrapView";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = createSupabaseServer();
  const { data: wrap } = await supabase
    .from("wraps")
    .select("*")
    .eq("id", id)
    .single();

  if (!wrap) return { title: "Wrap Not Found" };

  const monthName = MONTH_NAMES[wrap.month - 1];

  return {
    title: `${monthName} ${wrap.year} Wrapped — Monthly Wrapped`,
    description: `Check out this ${monthName} ${wrap.year} Monthly Wrapped featuring ${wrap.top_artists?.[0]?.name} and more.`,
    openGraph: {
      title: `${monthName} ${wrap.year} Monthly Wrapped`,
      description: `Top artists: ${wrap.top_artists?.map((a: { name: string }) => a.name).join(", ")}`,
      images: [{ url: wrap.image_url, width: 1080, height: 1350 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${monthName} ${wrap.year} Monthly Wrapped`,
      images: [wrap.image_url],
    },
  };
}

export default async function WrapPage({ params }: Props) {
  const { id } = await params;
  const supabase = createSupabaseServer();
  const { data: wrap } = await supabase
    .from("wraps")
    .select("*")
    .eq("id", id)
    .single();

  if (!wrap) notFound();

  return <WrapView wrap={wrap as Wrap} />;
}
