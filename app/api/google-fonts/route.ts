import { NextResponse } from "next/server";

const FALLBACK_FONTS = [
  "Inter",
  "Roboto",
  "Poppins",
  "Manrope",
  "DM Sans",
  "Nunito Sans",
  "Merriweather",
  "Lora",
  "Playfair Display",
  "Source Sans 3",
  "IBM Plex Sans",
  "Work Sans",
  "Space Grotesk",
  "Figtree",
  "Rubik",
  "Raleway",
  "Montserrat",
  "Open Sans",
  "Noto Sans",
  "Mulish",
  "Plus Jakarta Sans",
  "Sora",
  "Archivo",
  "Karla",
  "Cabin",
];

let cachedFonts: string[] | null = null;
let cacheExpiresAt = 0;

const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

export async function GET() {
  if (cachedFonts && Date.now() < cacheExpiresAt) {
    return NextResponse.json({ fonts: cachedFonts, source: "google-cache" });
  }

  const apiKey = process.env.GOOGLE_FONTS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ fonts: FALLBACK_FONTS, source: "fallback-missing-key" });
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=${apiKey}`,
      { next: { revalidate: 60 * 60 * 6 } },
    );

    if (!response.ok) {
      return NextResponse.json({ fonts: FALLBACK_FONTS, source: "fallback-fetch-failed" });
    }

    const data = (await response.json()) as { items?: Array<{ family?: string }> };
    const families = (data.items ?? [])
      .map((item) => item.family)
      .filter((family): family is string => Boolean(family))
      .slice(0, 400);

    if (families.length === 0) {
      return NextResponse.json({ fonts: FALLBACK_FONTS, source: "fallback-empty" });
    }

    cachedFonts = families;
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    return NextResponse.json({ fonts: families, source: "google" });
  } catch {
    return NextResponse.json({ fonts: FALLBACK_FONTS, source: "fallback-error" });
  }
}
