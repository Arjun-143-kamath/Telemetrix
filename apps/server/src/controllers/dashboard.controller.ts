import { getNextRace, getSeasonResults, getQualifyingResults, getCircuitStats, getPreviousFormAtCircuit } from '../services/ergast.service';
import { getDashboardWeather } from '../services/weather.service';
import axios from 'axios';
import { getFastestPitStop } from '../services/openf1.service';
import { getDriverOfTheDay, getTyreCompounds } from '../Scrappers/wiki.scraper';
import { getF1SessionResults } from '../services/f1.scraper';
import { Request, Response } from 'express';

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const results = await Promise.allSettled([
      getNextRace(),
      getSeasonResults(),
      getQualifyingResults()
    ]);
    
    const nextRace = results[0].status === 'fulfilled' ? results[0].value : null;
    const seasonResults = results[1].status === 'fulfilled' ? results[1].value : [];
    const qualifyingResults = results[2].status === 'fulfilled' ? results[2].value : [];

    let lat, lon;
    if (nextRace && nextRace.Circuit && nextRace.Circuit.Location) {
      lat = parseFloat(nextRace.Circuit.Location.lat);
      lon = parseFloat(nextRace.Circuit.Location.long);
    }
    
    const weather = await getDashboardWeather(lat, lon).catch(() => null);

    let lastRace: any = null;
    let lastRacePodium: any[] = [];
    let lastRaceQualifying: any = null;

    if (seasonResults.length > 0) {
      lastRace = seasonResults[seasonResults.length - 1];
      if (lastRace.Results) {
        lastRacePodium = lastRace.Results.slice(0, 3);
      }
      
      // Match the qualifying results for the same round
      if (qualifyingResults.length > 0 && lastRace.round) {
        lastRaceQualifying = qualifyingResults.find((q: any) => q.round === lastRace.round);
      }
    }

    let nextRaceResults: any = null;
    let nextRaceQualifying: any = null;
    
    if (nextRace) {
       nextRaceResults = seasonResults.find((r: any) => r.round === nextRace.round) || null;
       nextRaceQualifying = qualifyingResults.find((q: any) => q.round === nextRace.round) || null;
    }

    const circuitId = nextRace?.Circuit?.circuitId;
    const raceName = nextRace?.raceName;
    const season = nextRace?.season;

    const extras = await Promise.allSettled([
      getFastestPitStop(),
      circuitId ? getCircuitStats(circuitId) : Promise.resolve(null),
      (raceName && season) ? getTyreCompounds(raceName, season) : Promise.resolve([]),
      lastRace ? getDriverOfTheDay(lastRace.raceName, lastRace.season) : Promise.resolve('Info not available'),
      (circuitId && season) ? getPreviousFormAtCircuit(circuitId, season) : Promise.resolve(null),
      (season && nextRace?.round) ? getF1SessionResults(season, nextRace.round, 'practice-1') : Promise.resolve(null),
      (season && nextRace?.round) ? getF1SessionResults(season, nextRace.round, 'practice-2') : Promise.resolve(null),
      (season && nextRace?.round) ? getF1SessionResults(season, nextRace.round, 'practice-3') : Promise.resolve(null),
      (season && nextRace?.round) ? getF1SessionResults(season, nextRace.round, 'qualifying') : Promise.resolve(null),
      (season && nextRace?.round) ? getF1SessionResults(season, nextRace.round, 'race-result') : Promise.resolve(null)
    ]);

    const fastestPitStop = extras[0].status === 'fulfilled' ? extras[0].value : null;
    const circuitStats = extras[1].status === 'fulfilled' ? extras[1].value : null;
    const tyres = extras[2].status === 'fulfilled' ? extras[2].value : [];
    const driverOfTheDay = extras[3].status === 'fulfilled' ? extras[3].value : 'Info not available';
    const previousFormAtCircuit = extras[4].status === 'fulfilled' ? extras[4].value : null;

    const country = nextRace?.Circuit?.Location?.country;
    let openf1Sessions = [];
    if (country && season) {
      try {
        const resObj = await axios.get(`https://api.openf1.org/v1/sessions?year=${season}&country_name=${encodeURIComponent(country)}`);
        openf1Sessions = resObj.data;
      } catch (e: any) {
        console.error('Error fetching openf1 sessions:', e.message);
      }
    }

    const fp1Results = extras[5].status === 'fulfilled' ? extras[5].value : null;
    const fp2Results = extras[6].status === 'fulfilled' ? extras[6].value : null;
    const fp3Results = extras[7].status === 'fulfilled' ? extras[7].value : null;
    const f1QualiResults = extras[8].status === 'fulfilled' ? extras[8].value : null;
    const f1RaceResults = extras[9].status === 'fulfilled' ? extras[9].value : null;

    res.json({
      nextRace,
      lastRace,
      lastRacePodium,
      weather,
      fastestPitStop,
      lastRaceQualifying,
      circuitStats,
      tyres,
      driverOfTheDay,
      openf1Sessions,
      previousFormAtCircuit,
      nextRaceResults: f1RaceResults || nextRaceResults,
      nextRaceQualifying: f1QualiResults || nextRaceQualifying,
      fp1Results,
      fp2Results,
      fp3Results
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data', error });
  }
};
