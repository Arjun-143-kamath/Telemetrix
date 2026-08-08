import { getDashboardWeather } from '../services/weather.service';
import axios from 'axios';
import { Request, Response } from 'express';
import { DashboardExtra } from '../models/DashboardExtra';
import { openf1Axios } from '../utils/openf1Axios';
import { getSeasonCalendar, getSeasonResults, getQualifyingResults, getCircuitStats, getPreviousFormAtCircuit } from '../services/ergast.service';

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const races = await getSeasonCalendar();

    if (!races || races.length === 0) {
      return res.json({ message: 'No calendar data available' });
    }

    const now = new Date();
    const nextRace = races.find((r: any) => new Date(`${r.date}T${r.time || '00:00:00Z'}`) > now) || races[races.length - 1];
    
    let lastRace = null;
    const pastRaces = races.filter((r: any) => new Date(`${r.date}T${r.time || '00:00:00Z'}`) <= now);
    if (pastRaces.length > 0) {
      lastRace = pastRaces[pastRaces.length - 1];
    }

    let lat, lon;
    if (nextRace && nextRace.Circuit && nextRace.Circuit.Location) {
      lat = parseFloat(nextRace.Circuit.Location.lat);
      lon = parseFloat(nextRace.Circuit.Location.long);
    }
    
    const weather = await getDashboardWeather(lat, lon).catch(() => null);

    let lastRacePodium: any[] = [];
    let lastRaceQualifying: any = null;
    
    let nextRaceResults: any = nextRace;
    let nextRaceQualifying: any = nextRace;

    // Fetch season results from resilient cache
    const [seasonResults, seasonQualy] = await Promise.all([
      getSeasonResults(),
      getQualifyingResults()
    ]);

    if (lastRace) {
      const lrResults = seasonResults.find((r: any) => r.round === lastRace.round);
      if (lrResults && lrResults.Results) {
        lastRacePodium = lrResults.Results.slice(0, 3);
        lastRace.Results = lrResults.Results;
      }
      
      const lrQualy = seasonQualy.find((r: any) => r.round === lastRace.round);
      if (lrQualy && lrQualy.QualifyingResults) {
        lastRaceQualifying = lrQualy;
      }
    }
    
    if (nextRace) {
      const nrResults = seasonResults.find((r: any) => r.round === nextRace.round);
      if (nrResults && nrResults.Results) {
         nextRaceResults = nrResults;
      }
      const nrQualy = seasonQualy.find((r: any) => r.round === nextRace.round);
      if (nrQualy && nrQualy.QualifyingResults) {
         nextRaceQualifying = nrQualy;
      }
    }

    const circuitId = nextRace?.Circuit?.circuitId;
    const season = nextRace?.season;

    // Fetch extras from DashboardExtra model with catch to prevent crash if MongoDB is down
    const [
      fastestPitStopDoc,
      tyresDoc,
      dotdDoc,
      trackDataDoc,
      ergastCircuitStats,
      ergastPrevForm
    ] = await Promise.all([
      DashboardExtra.findOne({ key: 'fastest_pitstop' }).lean().catch(() => null),
      (season && nextRace?.round) ? DashboardExtra.findOne({ key: `tyres_${season}_${nextRace.round}` }).lean().catch(() => null) : null,
      (lastRace?.season && lastRace?.round) ? DashboardExtra.findOne({ key: `dotd_${lastRace.season}_${lastRace.round}` }).lean().catch(() => null) : null,
      (circuitId && season) ? DashboardExtra.findOne({ key: `track_data_${circuitId}_${season}` }).lean().catch(() => null) : null,
      circuitId ? getCircuitStats(circuitId) : null,
      (circuitId && season) ? getPreviousFormAtCircuit(circuitId, season) : null
    ]);

    const fastestPitStop = fastestPitStopDoc?.data || null;
    const tyres = tyresDoc?.data || [];
    const driverOfTheDay = dotdDoc?.data || 'Info not available';
    const trackData = trackDataDoc?.data || null;
    const previousFormAtCircuit = ergastPrevForm || null;
    
    let circuitStats = ergastCircuitStats || null;

    if (circuitStats && trackData) {
      circuitStats = { ...circuitStats, ...trackData };
    } else if (!circuitStats && trackData) {
      circuitStats = trackData;
    }

    // OpenF1 Sessions
    const country = nextRace?.Circuit?.Location?.country;
    let openf1Sessions = [];
    if (country && season) {
      try {
        const resObj = await openf1Axios.get(`/sessions?year=${season}&country_name=${encodeURIComponent(country)}`);
        openf1Sessions = resObj.data;
      } catch (e: any) {
        console.error('Error fetching openf1 sessions:', e.message);
      }
    }

    const payload = {
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
      nextRaceResults,
      nextRaceQualifying
    };

    res.json(payload);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data', error });
  }
};
