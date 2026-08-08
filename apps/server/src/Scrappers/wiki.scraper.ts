import axios from 'axios';
import * as cheerio from 'cheerio';
import { withCache } from '../services/cache.service';

export const getDriverOfTheDay = async (raceName: string, year: string | number) => {
  return withCache(`dotd_${year}_${raceName}`, async () => {
    try {
      if (!raceName || !year) return 'Info not available';
      
      const yearStr = year.toString();
      
      // The dataset repository has inconsistent casing across years
      const urlsToTry = [
        `https://raw.githubusercontent.com/toUpperCase78/formula1-datasets/master/Formula1_${yearStr}Season_DriverOfTheDayVotes.csv`,
        `https://raw.githubusercontent.com/toUpperCase78/formula1-datasets/master/Formula1_${yearStr}season_driverOfTheDayVotes.csv`
      ];

      let csvData = null;
      for (const url of urlsToTry) {
        try {
          const response = await axios.get(url, { timeout: 5000 });
          if (response.status === 200 && response.data) {
            csvData = response.data;
            break;
          }
        } catch (e) {
          // Ignore 404s and try next URL
        }
      }

      if (!csvData) {
        return 'Info not available';
      }

      const lines = csvData.split('\n').filter((l: string) => l.trim() !== '');
      const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
      
      const trackIndex = headers.indexOf('track');
      const firstPlaceIndex = headers.indexOf('1st place');
      const roundIndex = headers.indexOf('round');
      
      if (firstPlaceIndex === -1 || (trackIndex === -1 && roundIndex === -1)) {
        return 'Info not available';
      }

      const normalizedSearchName = raceName.toLowerCase().replace('grand prix', '').trim();

      for (let i = 1; i < lines.length; i++) {
        // Simple CSV parse assuming no quoted commas
        const cols = lines[i].split(',').map((c: string) => c.trim());
        const trackVal = trackIndex !== -1 ? cols[trackIndex]?.toLowerCase() : '';
        
        if (trackVal && (trackVal.includes(normalizedSearchName) || normalizedSearchName.includes(trackVal))) {
          return cols[firstPlaceIndex] || 'Info not available';
        }
      }

      return 'Info not available';
    } catch (error) {
      console.error(`Error fetching Driver of the Day for ${raceName} ${year}:`, error);
      return 'Info not available';
    }
  }, 7200); // Cache for 2 hours (7200 seconds)
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
