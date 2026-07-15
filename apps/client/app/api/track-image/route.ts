import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country'); // e.g. "Belgium", "Great_Britain"
  const year = searchParams.get('year') || new Date().getFullYear();

  if (!country) {
    return NextResponse.json({ error: 'Country parameter is required' }, { status: 400 });
  }

  try {
    // Attempt to scrape the official F1 website
    const url = `https://www.formula1.com/en/racing/${year}/${country}/Circuit.html`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch F1 website: ${res.status}`);
    }

    const html = await res.text();
    let trackImageUrl = null;

    // Use regex to find the latest 2026 (or current year) track map inside the raw HTML
    // F1 typically formats them as: common/f1/2026/track/2026track...detailed.png or similar
    const regex = /https:\/\/media\.formula1\.com\/image\/upload\/[^"'\s]*?(?:common\/f1\/\d{4}\/track\/)[^"'\s]*?detailed\.(?:png|webp|avif)/i;
    const match = html.match(regex);

    if (match && match[0]) {
      trackImageUrl = match[0];
    }

    // Fallback 1: Any image containing the country name and 'circuit'
    if (!trackImageUrl) {
       const fallbackRegex = new RegExp(`https://media\\.formula1\\.com/image/upload/[^"'\\s]*?(?:${country.toLowerCase().replace('_', '')}|circuit)[^"'\\s]*?\\.(?:png|webp)`, 'i');
       const fallbackMatch = html.match(fallbackRegex);
       if (fallbackMatch && fallbackMatch[0]) {
           trackImageUrl = fallbackMatch[0];
       }
    }

    // Fallback 2: The old 2018-redesign assets (has DRS zones)
    if (!trackImageUrl) {
      trackImageUrl = `https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/${country}_Circuit.png`;
    }

    return NextResponse.json({ imageUrl: trackImageUrl });
  } catch (error: any) {
    console.error('Error scraping track image:', error);
    
    // Final fallback to a generic pattern if scraping completely fails
    const fallbackUrl = `https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/${country}_Circuit.png`;
    
    return NextResponse.json({ imageUrl: fallbackUrl, warning: 'Scraping failed, used fallback URL.' });
  }
}
