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

    // Get unique circuits
    const circuitsMap = new Map();
    races.forEach((r: any) => circuitsMap.set(r.Circuit.circuitId, r.Circuit));
    const circuits = Array.from(circuitsMap.values());

    console.log(`Found ${circuits.length} unique circuits. Beginning scrape...`);

    for (const circuit of circuits) {
      try {
        const ext = 'png';
        const outputPath = path.join(OUTPUT_DIR, `${circuit.circuitId}.${ext}`);

        if (fs.existsSync(outputPath)) {
          console.log(`[SKIP] Map for ${circuit.circuitId} already exists.`);
          continue;
        }

        console.log(`Fetching MediaWiki API for ${circuit.circuitId}... (${circuit.url})`);
        const title = circuit.url.split('/wiki/')[1];
        
        const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${title}&prop=pageimages&format=json&pithumbsize=500`;
        const wikiRes = await axios.get(apiUrl, {
          headers: { 'User-Agent': 'F1RaceHub/1.0 (contact@example.com)' }
        });
        
        const pages = wikiRes.data.query.pages;
        const pageId = Object.keys(pages)[0];
        const imgUrl = pages[pageId]?.thumbnail?.source;

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
