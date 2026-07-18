import axios from 'axios';
import * as cheerio from 'cheerio';
import { withCache } from '../services/cache.service';

export const getDriverOfTheDay = async (raceName: string, year: string | number) => {
  return withCache(`dotd_${year}_${raceName}`, async () => {
    try {
      if (!raceName || !year) return 'Info not available';
      
      const formattedRaceName = raceName.toLowerCase().replace(/ /g, '-').replace('grand-prix', 'grand-prix');
      // e.g., https://www.formula1.com/en/racing/2024/Belgium.html
      // Driver of the day is usually on a dedicated page or in the race results.
      // Since scraping F1.com is complex and layout changes, we'll implement a basic Wikipedia scrape attempt first.
      
      const wikiUrl = `https://en.wikipedia.org/wiki/${year}_${raceName.replace(/ /g, '_')}`;
      const response = await axios.get(wikiUrl, { headers: { 'User-Agent': 'F1RaceHubBot/1.0 (https://github.com/f1racehub)' } });
      const $ = cheerio.load(response.data);
      
      // Look for "Driver of the Day" in the infobox or tables
      let dotd = 'Info not available';
      
      $('th').each((i, el) => {
        const text = $(el).text().toLowerCase();
        if (text.includes('driver of the day') || text.includes('driver of the race')) {
           const val = $(el).next('td').text().trim();
           if (val) {
             // Remove references like [21]
             dotd = val.replace(/\[\d+\]/g, '').trim();
           }
        }
      });
      
      return dotd;
    } catch (error) {
      console.error(`Error scraping Driver of the Day for ${raceName} ${year}:`, error);
      return 'Info not available';
    }
  }, 3600 * 24 * 7); // Cache for 7 days
};

export const getTyreCompounds = async (raceName: string, year: string | number) => {
  return withCache(`tyres_${year}_${raceName}`, async () => {
    try {
      if (!raceName || !year) return [];
      
      const wikiUrl = `https://en.wikipedia.org/wiki/${year}_${raceName.replace(/ /g, '_')}`;
      const response = await axios.get(wikiUrl, { headers: { 'User-Agent': 'F1RaceHubBot/1.0 (https://github.com/f1racehub)' } });
      const $ = cheerio.load(response.data);
      
      let tyres: string[] = [];
      
      // Look for "Tyre compounds" in infobox
      $('th').each((i, el) => {
        const text = $(el).text().toLowerCase();
        if (text.includes('tyre compounds') || text.includes('tires')) {
           const val = $(el).next('td').text().trim();
           if (val) {
             // Extract C1, C2, C3 etc.
             const matches = val.match(/C[1-5]/g);
             if (matches) {
                // Ensure unique values
                tyres = Array.from(new Set(matches)).sort();
             }
           }
        }
      });

      if (tyres.length === 0) {
        // Fallback: search paragraphs for Pirelli tyre mentions
        $('p').each((i, el) => {
          const text = $(el).text();
          if (text.toLowerCase().includes('pirelli') && text.toLowerCase().includes('tyre')) {
             const matches = text.match(/C[1-5]/g);
             if (matches && matches.length >= 2) {
                // Ensure unique values
                tyres = Array.from(new Set(matches)).sort();
                return false; // break loop
             }
          }
        });
      }
      
      return tyres.length > 0 ? tyres : [];
    } catch (error) {
      console.error(`Error scraping Tyre Compounds for ${raceName} ${year}:`, error);
      return [];
    }
  }, 3600 * 24); // Cache for 24 hours
};
