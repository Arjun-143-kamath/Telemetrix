import { Router } from 'express';
import axios from 'axios';
import { getSeasonCalendar, getSeasonResults } from '../services/ergast.service';
import { getDriverOfTheDay } from '../Scrappers/wiki.scraper';
import { getF1ComPracticeResults, getF1ComSprintQualifyingResults } from '../Scrappers/f1.scraper';
import { getFastestPitStop, getPracticeClassification } from '../services/openf1.service';
import { withCache } from '../services/cache.service';

const router = Router();
const JOLPICA_BASE_URL = 'http://api.jolpi.ca/ergast/f1';

router.get('/:round', async (req, res) => {
  const round = req.params.round;
  const year = (req.query.year as string) || new Date().getFullYear();
  
  try {
    const data = await withCache(`race_details_${year}_${round}`, async () => {
      // 1. Fetch Calendar Info
      // Use cached calendar if possible to avoid timeouts
      const calendar = await getSeasonCalendar();
      let raceInfo = calendar.find((r: any) => r.round === round && r.season === year.toString());

      if (!raceInfo) {
        try {
          const calendarRes = await axios.get(`${JOLPICA_BASE_URL}/${year}/${round}.json`, { timeout: 5000 });
          raceInfo = calendarRes.data.MRData.RaceTable.Races[0];
        } catch (e) {
          console.error(`Calendar fallback failed for round ${round}:`, e instanceof Error ? e.message : String(e));
        }
      }

      if (!raceInfo) {
        throw new Error('Race not found');
      }

      const raceName = raceInfo.raceName;
      const isSprintWeekend = !!raceInfo.Sprint;

      // 2. Fetch Sessions with timeouts
      const [raceResultsRes, qualiResultsRes, sprintResultsRes] = await Promise.all([
        axios.get(`${JOLPICA_BASE_URL}/${year}/${round}/results.json`, { timeout: 5000 }).catch(() => null),
        axios.get(`${JOLPICA_BASE_URL}/${year}/${round}/qualifying.json`, { timeout: 5000 }).catch(() => null),
        isSprintWeekend ? axios.get(`${JOLPICA_BASE_URL}/${year}/${round}/sprint.json`, { timeout: 5000 }).catch(() => null) : Promise.resolve(null)
      ]);

      const raceClassification = raceResultsRes?.data?.MRData?.RaceTable?.Races[0]?.Results || [];
      const qualiClassification = qualiResultsRes?.data?.MRData?.RaceTable?.Races[0]?.QualifyingResults || [];
      const sprintClassification = sprintResultsRes?.data?.MRData?.RaceTable?.Races[0]?.SprintResults || [];

      // 3. Fetch Extras (OpenF1 & Scraper)
      let fastestPitstop = null;
      try {
        const sessionsRes = await axios.get(`https://api.openf1.org/v1/sessions?year=${year}&country_name=${encodeURIComponent(raceInfo.Circuit.Location.country)}&session_name=Race`);
        const session = sessionsRes.data[0];
        if (session) {
          fastestPitstop = await getFastestPitStop(session.session_key);
        }
      } catch (e) {
        console.error('Error fetching fastest pitstop for round', round, e);
      }

      let fp1 = [], fp2 = [], fp3 = [];
      try {
        const fetchPractice = async (sessionName: string, sessionNumber: number) => {
          const sessionsRes = await axios.get(`https://api.openf1.org/v1/sessions?year=${year}&country_name=${encodeURIComponent(raceInfo.Circuit.Location.country)}&session_name=${encodeURIComponent(sessionName)}`).catch(() => ({ data: [] }));
          const session = sessionsRes.data[0];
          
          let results = [];
          if (session) {
            results = await getPracticeClassification(session.session_key);
          }
          
          if (results.length === 0) {
             results = await getF1ComPracticeResults(year, raceInfo.Circuit.Location.country, sessionNumber);
          }
          return results;
        };
        
        fp1 = await fetchPractice('Practice 1', 1);
        if (!isSprintWeekend) {
          fp2 = await fetchPractice('Practice 2', 2);
          fp3 = await fetchPractice('Practice 3', 3);
        }
      } catch (e) {
        console.error('Error fetching practice sessions for round', round, e);
      }

      let sprintQualifying = [];
      if (isSprintWeekend) {
        try {
          const sessionsRes = await axios.get(`https://api.openf1.org/v1/sessions?year=${year}&country_name=${encodeURIComponent(raceInfo.Circuit.Location.country)}&session_name=${encodeURIComponent('Sprint Qualifying')}`).catch(() => ({ data: [] }));
          const session = sessionsRes.data[0];
          
          if (session) {
            sprintQualifying = await getPracticeClassification(session.session_key);
          }
          
          if (sprintQualifying.length === 0) {
            sprintQualifying = await getF1ComSprintQualifyingResults(year, raceInfo.Circuit.Location.country);
          }
        } catch (e) {
          console.error('Error fetching sprint qualifying for round', round, e);
        }
      }

      const driverOfTheDay = await getDriverOfTheDay(raceName, year);

      return {
        round: raceInfo.round,
        raceName: raceInfo.raceName,
        circuit: raceInfo.Circuit,
        date: raceInfo.date,
        time: raceInfo.time,
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
  } catch (error) {
    console.error(`Error fetching details for round ${req.params.round}:`, error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error fetching race details', error });
    }
  }
});

export default router;
