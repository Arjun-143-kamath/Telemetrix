import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const JOLPICA_BASE_URL = 'http://api.jolpi.ca/ergast/f1';
const OUTPUT_DIR = path.join(__dirname, '../../client/public/tracks');

async function scrapeMaps() {
  try {
    console.log('Fetching 2026 calendar...');
    const response = await axios.get(`${JOLPICA_BASE_URL}/current.json`);
    const races = response.data.MRData.RaceTable.Races;

    // Clean up old tracks directory to remove tracks no longer on the calendar
    if (fs.existsSync(OUTPUT_DIR)) {
      console.log('Cleaning up old tracks...');
      fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // Get unique circuits
    const circuitsMap = new Map();
    races.forEach((r: any) => circuitsMap.set(r.Circuit.circuitId, r.Circuit));
    const circuits = Array.from(circuitsMap.values());

    console.log(`Found ${circuits.length} unique circuits. Beginning scrape...`);

    for (const circuit of circuits) {
      try {
        const ext = 'png';
        const outputPath = path.join(OUTPUT_DIR, `${circuit.circuitId}.${ext}`);



        const country = circuit.Location.country;
        const currentYear = new Date().getFullYear();
        let imgUrl = null;

        // Helper to try fetching from F1.com for a specific year
        const tryF1Com = async (year: number) => {
          try {
            const f1Res = await axios.get(`https://www.formula1.com/en/racing/${year}/${country}/Circuit.html`, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
              }
            });
            
            const html = f1Res.data;
            const regex = new RegExp(`https:\\/\\/media\\.formula1\\.com\\/image\\/upload\\/[^"'\\s]*?(?:common\\/f1\\/${year}\\/track\\/)[^"'\\s]*?detailed\\.(?:png|webp|avif)`, 'i');
            const match = html.match(regex);
            
            if (match && match[0]) {
               return match[0];
            } else {
               const fallbackRegex = new RegExp(`https://media\\.formula1\\.com/image/upload/[^"'\\s]*?(?:${country.toLowerCase().replace('_', '')}|circuit)[^"'\\s]*?\\.(?:png|webp)`, 'i');
               const fallbackMatch = html.match(fallbackRegex);
               if (fallbackMatch && fallbackMatch[0]) {
                   return fallbackMatch[0];
               }
            }
          } catch (e: any) {
            console.log(`[WARN] F1.com scrape failed or 404 for ${circuit.circuitId} (${year})`);
          }
          return null;
        };

        console.log(`Trying F1.com for ${circuit.circuitId} (${country}) for ${currentYear}...`);
        imgUrl = await tryF1Com(currentYear);
        
        if (!imgUrl) {
           console.log(`Trying F1.com for ${circuit.circuitId} (${country}) for ${currentYear - 1}...`);
           imgUrl = await tryF1Com(currentYear - 1);
        }

        if (!imgUrl) {
          console.log(`Fallback: Fetching MediaWiki API for ${circuit.circuitId}... (${circuit.url})`);
          let title = circuit.url.split('/wiki/')[1];
          if (title.includes('#')) {
             title = title.split('#')[0];
          }
          const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${title}&prop=pageimages&format=json&pithumbsize=500`;
          
          try {
            const wikiRes = await axios.get(apiUrl, {
              headers: { 'User-Agent': 'F1RaceHub/1.0 (contact@example.com)' }
            });
            const pages = wikiRes.data.query.pages;
            const pageId = Object.keys(pages)[0];
            imgUrl = pages[pageId]?.thumbnail?.source;
          } catch(e) {
            console.log(`[WARN] MediaWiki API failed for ${circuit.circuitId}`);
          }
        }

        if (!imgUrl) {
          console.log(`[WARN] Could not find map image for ${circuit.circuitId}`);
          continue;
        }

        console.log(`Downloading map for ${circuit.circuitId}: ${imgUrl}`);
        
        const { execSync } = require('child_process');
        execSync(`curl -s -o "${outputPath}" "${imgUrl}" -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)"`);

        console.log(`[SUCCESS] Saved ${circuit.circuitId}.png`);
        
        // Wait 1500ms to avoid hammering Wikipedia
        await new Promise(r => setTimeout(r, 1500));

      } catch (err) {
        console.error(`[ERROR] Failed to scrape ${circuit.circuitId}:`, err);
      }
    }

    console.log('Finished scraping track maps!');
  } catch (error) {
    console.error('Fatal Error:', error);
  }
}

scrapeMaps();
