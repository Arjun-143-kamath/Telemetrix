import { Request, Response } from 'express';
import axios from 'axios';
import { getSeasonCalendar } from '../services/ergast.service';
import { getDriverOfTheDay, getTyreCompounds } from '../Scrappers/wiki.scraper';
import { getF1ComPracticeResults, getF1ComSprintQualifyingResults } from '../Scrappers/f1.scraper';
import { getFastestPitStop, getPracticeClassification } from '../services/openf1.service';
import { withCache } from '../services/cache.service';

const JOLPICA_BASE_URL = 'https://api.jolpi.ca/ergast/f1';

const fetchPractice = async (year: string | number, country: string, sessionName: string, sessionNumber: number) => {
  try {
    const sessionsRes = await axios.get(`https://api.openf1.org/v1/sessions?year=${year}&country_name=${encodeURIComponent(country)}&session_name=${encodeURIComponent(sessionName)}`).catch(() => ({ data: [] }));
    const session = sessionsRes.data[0];
    
    let results = [];
    if (session) {
      results = await getPracticeClassification(session.session_key).catch(() => []);
    }
    
    if (results.length === 0) {
       results = await getF1ComPracticeResults(year, country, sessionNumber).catch(() => []);
    }
    return results;
  } catch (e) {
    console.error(`Error fetching practice ${sessionNumber}:`, e);
    return [];
  }
};

const fetchSprintQualifying = async (year: string | number, country: string) => {
  try {
    const sessionsRes = await axios.get(`https://api.openf1.org/v1/sessions?year=${year}&country_name=${encodeURIComponent(country)}&session_name=${encodeURIComponent('Sprint Qualifying')}`).catch(() => ({ data: [] }));
    const session = sessionsRes.data[0];
    
    let results = [];
    if (session) {
      results = await getPracticeClassification(session.session_key).catch(() => []);
    }
    
    if (results.length === 0) {
      results = await getF1ComSprintQualifyingResults(year, country).catch(() => []);
    }
    return results;
  } catch (e) {
    console.error('Error fetching sprint qualifying:', e);
    return [];
  }
};

const fetchFastestPitstop = async (year: string | number, country: string) => {
  try {
    const sessionsRes = await axios.get(`https://api.openf1.org/v1/sessions?year=${year}&country_name=${encodeURIComponent(country)}&session_name=Race`).catch(() => ({ data: [] }));
    const session = sessionsRes.data[0];
    if (session) {
      return await getFastestPitStop(session.session_key).catch(() => null);
    }
    return null;
  } catch (e) {
    console.error('Error fetching fastest pitstop:', e);
    return null;
  }
};

export const getRaceDetails = async (req: Request, res: Response) => {
  const round = req.params.round;
  const year = (req.query.year as string) || new Date().getFullYear().toString();
  
  try {
    const data = await withCache(`race_details_${year}_${round}`, async () => {
      // 1. Fetch Calendar Info
      const calendar = await getSeasonCalendar();
      let raceInfo = calendar.find((r: any) => r.round === round && r.season === year.toString());

      if (!raceInfo) {
        try {
          const calendarRes = await axios.get(`${JOLPICA_BASE_URL}/${year}/${round}.json`, { timeout: 5000 });
          if (calendarRes.data.MRData.RaceTable.Races.length > 0) {
            raceInfo = calendarRes.data.MRData.RaceTable.Races[0];
          }
        } catch (e: any) {
          console.error(`Calendar fallback failed for round ${round}:`, e.message);
        }
      }

      if (!raceInfo) {
        throw new Error('Race not found');
      }

      const raceName = raceInfo.raceName;
      const isSprintWeekend = !!raceInfo.Sprint;
      const country = raceInfo.Circuit.Location.country;

      // 2. Fetch Core Sessions (Ergast)
      const sessionResults = await Promise.allSettled([
        axios.get(`${JOLPICA_BASE_URL}/${year}/${round}/results.json`, { timeout: 5000 }),
        axios.get(`${JOLPICA_BASE_URL}/${year}/${round}/qualifying.json`, { timeout: 5000 }),
        isSprintWeekend ? axios.get(`${JOLPICA_BASE_URL}/${year}/${round}/sprint.json`, { timeout: 5000 }) : Promise.resolve(null)
      ]);

      const raceClassification = sessionResults[0].status === 'fulfilled' && sessionResults[0].value ? sessionResults[0].value.data.MRData.RaceTable.Races[0]?.Results || [] : [];
      const qualiClassification = sessionResults[1].status === 'fulfilled' && sessionResults[1].value ? sessionResults[1].value.data.MRData.RaceTable.Races[0]?.QualifyingResults || [] : [];
      const sprintClassification = sessionResults[2].status === 'fulfilled' && sessionResults[2].value ? sessionResults[2].value.data.MRData.RaceTable.Races[0]?.SprintResults || [] : [];

      // 3. Fetch Extras (Practices, Pitstops, Scrapers)
      const extraResults = await Promise.allSettled([
        fetchFastestPitstop(year, country),
        getDriverOfTheDay(raceName, year),
        getTyreCompounds(raceName, year),
        fetchPractice(year, country, 'Practice 1', 1),
        !isSprintWeekend ? fetchPractice(year, country, 'Practice 2', 2) : Promise.resolve([]),
        !isSprintWeekend ? fetchPractice(year, country, 'Practice 3', 3) : Promise.resolve([]),
        isSprintWeekend ? fetchSprintQualifying(year, country) : Promise.resolve([])
      ]);

      const fastestPitstop = extraResults[0].status === 'fulfilled' ? extraResults[0].value : null;
      const driverOfTheDay = extraResults[1].status === 'fulfilled' ? extraResults[1].value : 'Info not available';
      const tyres = extraResults[2].status === 'fulfilled' ? extraResults[2].value : [];
      const fp1 = extraResults[3].status === 'fulfilled' ? extraResults[3].value : [];
      const fp2 = extraResults[4].status === 'fulfilled' ? extraResults[4].value : [];
      const fp3 = extraResults[5].status === 'fulfilled' ? extraResults[5].value : [];
      const sprintQualifying = extraResults[6].status === 'fulfilled' ? extraResults[6].value : [];

      return {
        round: raceInfo.round,
        raceName: raceInfo.raceName,
        circuit: raceInfo.Circuit,
        date: raceInfo.date,
        time: raceInfo.time,
        tyres,
        isSprintWeekend,
        sessions: {
          race: { classification: raceClassification, fastestPitstop, driverOfTheDay },
          qualifying: { classification: qualiClassification },
          sprint: { classification: sprintClassification },
          sprint_qualifying: { classification: sprintQualifying },
          fp1: { classification: fp1 },
          fp2: { classification: fp2 },
          fp3: { classification: fp3 }
        }
      };
    }, 3600); // Cache for 1 hour

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.json(data);
  } catch (error: any) {
    console.error(`Error fetching details for round ${round}:`, error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error fetching race details', error: error.message });
    }
  }
};
