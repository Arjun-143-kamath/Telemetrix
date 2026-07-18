import { Router } from 'express';
import Driver from '../models/Driver';
import Circuit from '../models/Circuit';
import Race from '../models/Race';
import { getNextRace, getSeasonResults, getQualifyingResults, getCircuitStats } from '../services/ergast.service';
import { getDashboardWeather } from '../services/weather.service';
import { getFastestPitStop } from '../services/openf1.service';
import { getDriverOfTheDay, getTyreCompounds } from '../Scrappers/wiki.scraper';
import standingsRoute from './standings';

import calendarRoute from './calendar';
import racesRoute from './races';

const router = Router();

router.use('/standings', standingsRoute);
router.use('/calendar', calendarRoute);
router.use('/races', racesRoute);

// --- Dashboard Aggregator Route ---
router.get('/dashboard', async (req, res) => {
  try {
    const [nextRace, seasonResults, qualifyingResults] = await Promise.all([
      getNextRace(),
      getSeasonResults(),
      getQualifyingResults()
    ]);

    let lat, lon;
    if (nextRace && nextRace.Circuit && nextRace.Circuit.Location) {
      lat = parseFloat(nextRace.Circuit.Location.lat);
      lon = parseFloat(nextRace.Circuit.Location.long);
    }
    
    const weather = await getDashboardWeather(lat, lon);

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

    const circuitId = nextRace?.Circuit?.circuitId;
    const raceName = nextRace?.raceName;
    const season = nextRace?.season;

    const [fastestPitStop, circuitStats, tyres, driverOfTheDay] = await Promise.all([
      getFastestPitStop(),
      circuitId ? getCircuitStats(circuitId) : Promise.resolve(null),
      (raceName && season) ? getTyreCompounds(raceName, season) : Promise.resolve([]),
      lastRace ? getDriverOfTheDay(lastRace.raceName, lastRace.season) : Promise.resolve('Info not available')
    ]);

    res.json({
      nextRace,
      lastRace,
      lastRacePodium,
      weather,
      fastestPitStop,
      lastRaceQualifying,
      circuitStats,
      tyres,
      driverOfTheDay
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data', error });
  }
});

// --- Driver Routes ---
router.get('/drivers', async (req, res) => {
  try {
    const drivers = await Driver.find({});
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching drivers', error });
  }
});

// --- Circuit Routes ---
router.get('/circuits', async (req, res) => {
  try {
    const circuits = await Circuit.find({});
    res.json(circuits);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching circuits', error });
  }
});

// --- Race Routes ---
router.get('/races', async (req, res) => {
  try {
    const races = await Race.find({}).populate('Circuit');
    res.json(races);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching races', error });
  }
});

export default router;
