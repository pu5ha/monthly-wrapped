import sharp from "sharp";

const WIDTH = 1080;
const HEIGHT = 1350; // Instagram portrait ratio
const PHOTO_SIZE = 500;

interface ComposeFinalImageData {
  month: string;
  year: number;
  topTracks: { name: string }[];
  topArtists: { name: string }[];
  genre: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cleanSongName(name: string): string {
  let clean = name.replace(/\s*[\(\[]\s*(?:feat|ft)\.?\s+[^\)\]]+[\)\]]/gi, "");
  clean = clean.replace(/\s*[-–—]\s+.*(?:remix|mix|edit|version|remaster)\b.*/i, "");
  return clean.trim();
}

function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen - 1) + "\u2026" : str;
}

async function createSquarePhoto(photoBuffer: Buffer): Promise<Buffer> {
  const radius = 24;
  const mask = Buffer.from(
    `<svg width="${PHOTO_SIZE}" height="${PHOTO_SIZE}">
      <rect width="${PHOTO_SIZE}" height="${PHOTO_SIZE}" rx="${radius}" ry="${radius}" fill="white"/>
    </svg>`
  );

  return sharp(photoBuffer)
    .resize(PHOTO_SIZE, PHOTO_SIZE, { fit: "cover" })
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

export async function composeFinalImage(
  aiBackground: Buffer,
  artistPhoto: Buffer,
  data: ComposeFinalImageData
): Promise<Buffer> {
  // Spacious layout — title at top, photo below, lists below that
  const titleY = 120;
  const photoTop = titleY + 70;
  const listsTop = photoTop + PHOTO_SIZE + 70;
  const listStartY = listsTop + 75;
  const lineHeight = 68;
  const genreY = listStartY + 5 * lineHeight + 40;
  const footerY = genreY + 60;

  // 1. Stretch AI background to fill entire canvas
  const fullBg = await sharp(aiBackground)
    .resize(WIDTH, HEIGHT, { fit: "cover" })
    .png()
    .toBuffer();

  // 2. Create square artist photo with rounded corners
  const squarePhoto = await createSquarePhoto(artistPhoto);

  // 3. Dark gradient overlay — lets color show at top, fades to dark for text
  const gradientOverlay = Buffer.from(
    `<svg width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#111111" stop-opacity="0.1"/>
          <stop offset="35%" stop-color="#111111" stop-opacity="0.3"/>
          <stop offset="50%" stop-color="#111111" stop-opacity="0.75"/>
          <stop offset="62%" stop-color="#111111" stop-opacity="0.92"/>
          <stop offset="100%" stop-color="#111111" stop-opacity="0.95"/>
        </linearGradient>
      </defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#fade)"/>
    </svg>`
  );

  // 4. All text in one SVG layer
  const colLeftX = 80;
  const colRightX = WIDTH / 2 + 40;
  const maxChars = 20;

  const artistLines = data.topArtists
    .slice(0, 5)
    .map(
      (a, i) =>
        `<text x="${colLeftX}" y="${listStartY + i * lineHeight}" font-family="Impact, Arial Black, sans-serif" font-size="36" fill="white" font-weight="bold"><tspan fill="rgba(255,255,255,0.35)" font-family="Arial, sans-serif" font-size="28">${i + 1}.</tspan>  ${escapeXml(truncate(a.name, maxChars))}</text>`
    )
    .join("\n");

  const trackLines = data.topTracks
    .slice(0, 5)
    .map(
      (t, i) =>
        `<text x="${colRightX}" y="${listStartY + i * lineHeight}" font-family="Impact, Arial Black, sans-serif" font-size="36" fill="white" font-weight="bold"><tspan fill="rgba(255,255,255,0.35)" font-family="Arial, sans-serif" font-size="28">${i + 1}.</tspan>  ${escapeXml(truncate(cleanSongName(t.name), maxChars))}</text>`
    )
    .join("\n");

  const titleText = `${escapeXml(data.month)} Wrapped`;
  const genreText = data.genre ? `Your Vibe: ${escapeXml(data.genre)}` : "";

  // Large decorative year digits running vertically down the left side
  const yearStr = String(data.year);
  const yearDigitSize = 180;
  const yearX = 50;
  const yearStartY = 220;
  const yearSpacing = 150;
  const yearDigits = yearStr
    .split("")
    .map(
      (digit, i) =>
        `<text x="${yearX}" y="${yearStartY + i * yearSpacing}" font-family="Impact, Arial Black, sans-serif" font-size="${yearDigitSize}" fill="rgba(255,255,255,0.25)" font-weight="900" letter-spacing="-5">${digit}</text>`
    )
    .join("\n");

  const textSvg = Buffer.from(
    `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#000000" flood-opacity="0.7"/>
        </filter>
      </defs>

      <!-- Large vertical year on left side -->
      ${yearDigits}

      <!-- Title with drop shadow -->
      <text x="${WIDTH / 2}" y="${titleY}" font-family="Arial Black, Impact, sans-serif" font-size="62" fill="white" font-weight="900" text-anchor="middle" filter="url(#shadow)">
        ${titleText}
      </text>

      <!-- Section headers -->
      <text x="${colLeftX}" y="${listsTop}" font-family="Arial Black, Impact, sans-serif" font-size="24" fill="white" font-weight="900" letter-spacing="3">
        TOP ARTISTS
      </text>
      <text x="${colRightX}" y="${listsTop}" font-family="Arial Black, Impact, sans-serif" font-size="24" fill="white" font-weight="900" letter-spacing="3">
        TOP SONGS
      </text>

      ${artistLines}
      ${trackLines}

      <!-- Vertical divider -->
      <line x1="${WIDTH / 2}" y1="${listsTop - 15}" x2="${WIDTH / 2}" y2="${listStartY + 4 * lineHeight + 20}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>

      <!-- Genre line -->
      ${genreText ? `<text x="${WIDTH / 2}" y="${genreY}" font-family="Arial Black, Impact, sans-serif" font-size="30" fill="white" text-anchor="middle" font-weight="900" letter-spacing="2" filter="url(#shadow)">${genreText}</text>` : ""}

      <!-- Footer -->
      <text x="${WIDTH / 2}" y="${footerY}" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="rgba(255,255,255,0.3)" text-anchor="middle" letter-spacing="1">
        monthwrapped.com
      </text>
    </svg>`
  );

  // 5. Compose everything
  const photoLeft = Math.round((WIDTH - PHOTO_SIZE) / 2);

  const result = await sharp(fullBg)
    .composite([
      { input: gradientOverlay, top: 0, left: 0 },
      { input: squarePhoto, top: photoTop, left: photoLeft },
      { input: textSvg, top: 0, left: 0 },
    ])
    .png()
    .toBuffer();

  return result;
}
