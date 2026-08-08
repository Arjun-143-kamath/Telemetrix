import { getDashboardWeather } from '../services/weather.service';
import axios from 'axios';
import { Request, Response } from 'express';
import { Race } from '../models/Race';
import { DashboardExtra } from '../models/DashboardExtra';
import { openf1Axios } from '../utils/openf1Axios';

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const currentYear = new Date().getFullYear().toString();
    const races = await Race.find({ season: currentYear }).lean();
    races.sort((a: any, b: any) => parseInt(a.round) - parseInt(b.round));

    if (!races || races.length === 0) {
      throw new Error('MongoDB has empty calendar data for dashboard');
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

    if (lastRace) {
      if (lastRace.Results) {
        lastRacePodium = lastRace.Results.slice(0, 3);
      }
      if (lastRace.QualifyingResults) {
        lastRaceQualifying = lastRace; // The UI expects the whole race object for lastRaceQualifying sometimes, wait, no, the UI expects the QualifyingResults array or the race itself? In previous code it was `lastRaceQualifying = qualifyingResults.find(q => q.round === lastRace.round)`. That returned the race object containing QualifyingResults. So we can just use lastRace.
      }
    }

    const circuitId = nextRace?.Circuit?.circuitId;
    const season = nextRace?.season;

    // Fetch extras from DashboardExtra model
    const [
      fastestPitStopDoc,
      circuitStatsDoc,
      tyresDoc,
      dotdDoc,
      prevFormDoc,
      trackDataDoc
    ] = await Promise.all([
      DashboardExtra.findOne({ key: 'fastest_pitstop' }).lean(),
      circuitId ? DashboardExtra.findOne({ key: `circuit_stats_${circuitId}` }).lean() : null,
      (season && nextRace?.round) ? DashboardExtra.findOne({ key: `tyres_${season}_${nextRace.round}` }).lean() : null,
      (lastRace?.season && lastRace?.round) ? DashboardExtra.findOne({ key: `dotd_${lastRace.season}_${lastRace.round}` }).lean() : null,
      (circuitId && season) ? DashboardExtra.findOne({ key: `prev_form_${circuitId}_${season}` }).lean() : null,
      (circuitId && season) ? DashboardExtra.findOne({ key: `track_data_${circuitId}_${season}` }).lean() : null
    ]);

    const fastestPitStop = fastestPitStopDoc?.data || null;
    let circuitStats = circuitStatsDoc?.data || null;
    const tyres = tyresDoc?.data || [];
    const driverOfTheDay = dotdDoc?.data || 'Info not available';
    const previousFormAtCircuit = prevFormDoc?.data || null;
    const trackData = trackDataDoc?.data || null;

    if (circuitStats && trackData) {
      circuitStats = { ...circuitStats, ...trackData };
    } else if (!circuitStats && trackData) {
      circuitStats = trackData;
    }

    // OpenF1 Sessions (Live fetched if needed, or we can just leave it as live)
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
      lastRaceQualifying: lastRace,
      circuitStats,
      tyres,
      driverOfTheDay,
      openf1Sessions,
      previousFormAtCircuit,
      nextRaceResults: nextRace,
      nextRaceQualifying: nextRace
    };

    res.json(payload);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data from MongoDB', error });
  }
};
