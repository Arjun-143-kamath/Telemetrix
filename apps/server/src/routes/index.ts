import { Router } from 'express';
import Driver from '../models/Driver';
import Circuit from '../models/Circuit';
import Race from '../models/Race';
import { getNextRace, getSeasonResults, getQualifyingResults, getCircuitStats } from '../services/ergast.service';
import { getDashboardWeather } from '../services/weather.service';
import { getFastestPitStop } from '../services/openf1.service';
import { getDriverOfTheDay, getTyreCompounds } from '../services/scraper.service';
import standingsRoute from './standings';

const router = Router();

router.use('/standings', standingsRoute);

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

    // Try fetching fastest pit stop for latest session
    const fastestPitStop = await getFastestPitStop();
    
    // Fetch aggregated/scraped data for the dashboard
    let circuitStats = null;
    let tyres: string[] = [];
    let driverOfTheDay = 'Info not available';
    
    if (nextRace) {
       const circuitId = nextRace.Circuit?.circuitId;
       const raceName = nextRace.raceName;
       const season = nextRace.season;
       
       if (circuitId) {
         circuitStats = await getCircuitStats(circuitId);
       }
       if (raceName && season) {
         tyres = await getTyreCompounds(raceName, season);
       }
    }
    
    if (lastRace) {
       driverOfTheDay = await getDriverOfTheDay(lastRace.raceName, lastRace.season);
    }

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
