import axios from 'axios';
import * as cheerio from 'cheerio';
import { withCache } from '../services/cache.service';

/**
 * Normalizes a country name to match F1.com URL slugs
 */
const normalizeCountry = (country: string) => {
  return country.toLowerCase().replace(/ /g, '-').replace('united-states', 'usa').replace('uk', 'great-britain');
};

/**
 * Dynamically fetches the F1.com internal race ID for a given country and year
 */
export const getF1ComRaceId = async (year: string | number, country: string): Promise<string | null> => {
  return withCache(`f1com_race_id_${year}_${country}`, async () => {
    try {
      const url = `https://www.formula1.com/en/results/${year}/races`;
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const $ = cheerio.load(data);
      
      const normalizedCountry = normalizeCountry(country);
      let raceId = null;
      
      $('a[href*="/races/"]').each((i, el) => {
        const href = $(el).attr('href');
        if (href) {
          const match = href.match(/\/races\/(\d+)\/([^\/]+)\//);
          if (match) {
            const id = match[1];
            const slug = match[2];
            // Match against country name or slug
            if (id && slug && (slug.includes(normalizedCountry) || normalizedCountry.includes(slug))) {
              raceId = id;
            }
          }
        }
      });
      
      return raceId;
    } catch (e) {
      console.error(`Error fetching F1.com race IDs for ${year}:`, e);
      return null;
    }
  }, 3600 * 24 * 7); // Cache for 7 days
};

/**
 * Scrapes practice session results directly from F1.com
 */
export const getF1ComPracticeResults = async (year: string | number, country: string, sessionNumber: number) => {
  return withCache(`f1com_practice_${sessionNumber}_${year}_${country}`, async () => {
    try {
      const raceId = await getF1ComRaceId(year, country);
      if (!raceId) {
        console.warn(`Could not find F1.com race ID for ${country} ${year}`);
        return [];
      }
      
      const url = `https://www.formula1.com/en/results/${year}/races/${raceId}/${normalizeCountry(country)}/practice/${sessionNumber}`;
      console.log(`Scraping fallback practice data from: ${url}`);
      
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const $ = cheerio.load(data);
      
      const classification: any[] = [];
      const table = $('table').first();
      
      table.find('tbody tr').each((i, tr) => {
        const tds = $(tr).find('td');
        if (tds.length >= 6) {
          const pos = $(tds[0]).text().trim();
          const no = $(tds[1]).text().trim();
          // The driver name usually has first and last names in different spans, we grab all text and format it
          const rawDriverText = $(tds[2]).text().trim();
          const driverParts = rawDriverText.split(/(?=[A-Z]{3}$)/); // Try to split off the 3-letter acronym
          const namePart = driverParts[0] || rawDriverText;
          
          const car = $(tds[3]).text().trim();
          const time = $(tds[4]).text().trim();
          const gap = $(tds[5]).text().trim();
          
          const nameParts = namePart.split(/\s+/);
          
          classification.push({
            position: pos,
            driverId: namePart.toLowerCase().replace(/\s+/g, '_'),
            Driver: {
              givenName: nameParts[0],
              familyName: nameParts.slice(1).join(' '),
              permanentNumber: no
            },
            Constructor: {
              name: car
            },
            Time: {
              time: time,
              gap: time 
            },
            points: "0"
          });
        }
      });
      
      return classification;
    } catch (e) {
      console.error(`Error scraping F1.com practice ${sessionNumber} for ${country} ${year}:`, e);
      return [];
    }
  }, 3600);
};

/**
 * Scrapes Sprint Qualifying results directly from F1.com
 */
export const getF1ComSprintQualifyingResults = async (year: string | number, country: string) => {
  return withCache(`f1com_sprint_qualifying_${year}_${country}`, async () => {
    try {
      const raceId = await getF1ComRaceId(year, country);
      if (!raceId) {
        console.warn(`Could not find F1.com race ID for ${country} ${year}`);
        return [];
      }
      
      const url = `https://www.formula1.com/en/results/${year}/races/${raceId}/${normalizeCountry(country)}/sprint-qualifying`;
      console.log(`Scraping fallback sprint qualifying data from: ${url}`);
      
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const $ = cheerio.load(data);
      
      const classification: any[] = [];
      const table = $('table').first();
      
      table.find('tbody tr').each((i, tr) => {
        const tds = $(tr).find('td');
        if (tds.length >= 6) {
          const pos = $(tds[0]).text().trim();
          const no = $(tds[1]).text().trim();
          const rawDriverText = $(tds[2]).text().trim();
          const driverParts = rawDriverText.split(/(?=[A-Z]{3}$)/);
          const namePart = driverParts[0] || rawDriverText;
          
          const car = $(tds[3]).text().trim();
          const time = $(tds[4]).text().trim();
          const gap = $(tds[5]).text().trim();
          
          const nameParts = namePart.split(/\s+/);
          
          classification.push({
            position: pos,
            driverId: namePart.toLowerCase().replace(/\s+/g, '_'),
            Driver: {
              givenName: nameParts[0],
              familyName: nameParts.slice(1).join(' '),
              permanentNumber: no
            },
            Constructor: {
              name: car
            },
            Time: {
              time: time,
              gap: time
            },
            points: "0"
          });
        }
      });
      
      return classification;
    } catch (e) {
      console.error(`Error scraping F1.com sprint qualifying for ${country} ${year}:`, e);
      return [];
    }
  }, 3600);
};
