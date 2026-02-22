import { GoogleGenAI } from "@google/genai";

function getAI() {
  return new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });
}

interface WrapBackgroundData {
  month: string;
  year: number;
  topArtists: { name: string }[];
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateWrapBackground(
  data: WrapBackgroundData
): Promise<Buffer> {
  const artistNames = data.topArtists.map((a) => a.name).join(", ");

  const monthPalettes: Record<string, string> = {
    January: "icy blues, cool whites, and silver with hints of deep navy — crisp winter vibes",
    February: "warm reds, deep pinks, soft magentas, and rose gold — romantic and rich",
    March: "fresh greens, soft yellows, and light teals — early spring energy",
    April: "pastel lavender, sky blue, soft pink, and mint green — spring rain and blossoms",
    May: "vivid coral, golden yellow, bright green, and warm peach — full bloom sunshine",
    June: "electric orange, hot pink, bright cyan, and golden amber — summer heat",
    July: "fiery red, sunset orange, deep magenta, and tropical teal — peak summer",
    August: "warm amber, burnt orange, golden yellow, and dusty rose — late summer glow",
    September: "burnt sienna, deep orange, olive green, and warm brown — early autumn",
    October: "deep purple, midnight blue, burnt orange, and dark red — moody fall nights",
    November: "rich burgundy, dark gold, deep brown, and muted plum — cozy and warm",
    December: "emerald green, deep red, gold, and midnight blue — festive and elegant",
  };

  const palette = monthPalettes[data.month] || "vibrant saturated colors";

  const prompt = `Create a vibrant abstract gradient background artwork. DO NOT include any text, words, letters, or numbers.

Color palette: ${palette}

Style: Rich colorful gradients with gentle flowing curves and soft bokeh-like light spots. Blend 3-4 saturated colors. The colors should feel alive and energetic but not cluttered. Smooth transitions with subtle light flares and soft glowing orbs scattered throughout.

Mood: This is for a music fan who listens to ${artistNames}. Let their vibe influence the energy.

The image MUST fill the entire canvas edge-to-edge with NO white borders, NO margins, NO padding, NO blank edges.

CRITICAL: No text, no letters, no words, no numbers anywhere. Just vibrant abstract color art filling every pixel.`;

  const ai = getAI();

  // Retry up to 3 times with backoff for rate limits
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: prompt,
        config: {
          responseModalities: ["TEXT", "IMAGE"],
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (!parts) throw new Error("No response from Nano Banana");

      for (const part of parts) {
        if (part.inlineData) {
          return Buffer.from(part.inlineData.data!, "base64");
        }
      }

      throw new Error("No image in response");
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      if (err.status === 429 && attempt < 2) {
        console.log(`Rate limited, retrying in ${(attempt + 1) * 20}s...`);
        await sleep((attempt + 1) * 20000);
        continue;
      }
      throw error;
    }
  }

  throw new Error("Failed after 3 attempts");
}

export async function generateGenreSummary(
  artists: { name: string; genres: string[] }[],
  tracks: { name: string }[]
): Promise<string> {
  const artistList = artists
    .map((a) => `${a.name} (genres: ${(a.genres ?? []).join(", ") || "unknown"})`)
    .join("\n");
  const trackList = tracks.map((t) => t.name).join(", ");

  const prompt = `Based on this person's top Spotify artists and tracks for the month, give me a single short genre label (2-4 words max) that best describes their listening taste. Be creative and specific — not just "Pop" or "Rock". Examples: "Indie Hip-Hop", "Alternative R&B", "Dream Pop", "Classic Soul", "Bedroom Pop Rap".

Top Artists:
${artistList}

Top Tracks:
${trackList}

Respond with ONLY the genre label, nothing else.`;

  const ai = getAI();

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!text) throw new Error("No genre response from Gemini");

      return text;
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      if (err.status === 429 && attempt < 2) {
        console.log(`Genre rate limited, retrying in ${(attempt + 1) * 10}s...`);
        await sleep((attempt + 1) * 10000);
        continue;
      }
      throw error;
    }
  }

  throw new Error("Genre detection failed after 3 attempts");
}
