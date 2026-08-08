import axios from 'axios';
import { Race } from '../models/Race';
import { Standing } from '../models/Standing';
import { DashboardExtra } from '../models/DashboardExtra';
import { getFastestPitStop } from './openf1.service';
import { getDriverOfTheDay, getTyreCompounds } from '../Scrappers/wiki.scraper';
import { getCircuitStats, getPreviousFormAtCircuit } from './ergast.service';

const JOLPICA_BASE_URL = 'https://api.jolpi.ca/ergast/f1';

// Recursively removes keys with null, undefined, "Info not available", or "N/A"
const sanitizeData = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeData).filter(item => item !== null && item !== undefined);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const val = sanitizeData(obj[key]);
      if (
        val !== null &&
        val !== undefined &&
        val !== 'Info not available' &&
        val !== 'N/A' &&
        val !== ''
      ) {
        acc[key] = val;
      }
      return acc;
    }, {} as any);
  }
  return obj;
};

export const runSync = async () => {
  console.log('Starting data synchronization with external APIs...');
  
  try {
    // 1. Fetch Core Jolpica Data
    const [
      calendarRes,
      driverStandingsRes,
      constructorStandingsRes
    ] = await Promise.all([
      axios.get(`${JOLPICA_BASE_URL}/current.json`),
      axios.get(`${JOLPICA_BASE_URL}/current/driverStandings.json`),
      axios.get(`${JOLPICA_BASE_URL}/current/constructorStandings.json`)
    ]);

    const races = calendarRes.data?.MRData?.RaceTable?.Races || [];
    const dStandings = driverStandingsRes.data?.MRData?.StandingsTable?.StandingsLists[0]?.DriverStandings || [];
    const cStandings = constructorStandingsRes.data?.MRData?.StandingsTable?.StandingsLists[0]?.ConstructorStandings || [];

    // 2. Fetch Results and Qualifying Results (paginated)
    const resultsMap = new Map();
    let offset = 0;
    let limit = 100;
    let total = limit;
    while (offset < total) {
      const res = await axios.get(`${JOLPICA_BASE_URL}/current/results.json?limit=${limit}&offset=${offset}`);
      const data = res.data.MRData;
      total = parseInt(data.total);
      (data.RaceTable.Races || []).forEach((race: any) => {
        if (!resultsMap.has(race.round)) resultsMap.set(race.round, []);
        resultsMap.get(race.round).push(...race.Results);
      });
      offset += limit;
    }

    const qualyMap = new Map();
    offset = 0;
    total = limit;
    while (offset < total) {
      const res = await axios.get(`${JOLPICA_BASE_URL}/current/qualifying.json?limit=${limit}&offset=${offset}`);
      const data = res.data.MRData;
      total = parseInt(data.total);
      (data.RaceTable.Races || []).forEach((race: any) => {
        if (!qualyMap.has(race.round)) qualyMap.set(race.round, []);
        qualyMap.get(race.round).push(...race.QualifyingResults);
      });
      offset += limit;
    }

    // 3. Save Races to MongoDB
    for (const race of races) {
      const roundResults = resultsMap.get(race.round) || null;
      const roundQualy = qualyMap.get(race.round) || null;
      
      let winner = null;
      if (roundResults && roundResults.length > 0) {
        winner = roundResults.find((r: any) => r.position === '1')?.Driver || null;
      }

      const raceDoc = {
        ...race,
        Results: roundResults,
        QualifyingResults: roundQualy,
        winner
      };

      const sanitizedRace = sanitizeData(raceDoc);

      await Race.findOneAndUpdate(
        { season: sanitizedRace.season, round: sanitizedRace.round },
        { $set: sanitizedRace },
        { upsert: true, returnDocument: 'after' }
      );
    }
    console.log(`Synced ${races.length} races to MongoDB.`);

    // 4. Save Standings
    if (dStandings.length > 0) {
      const sanitizedDStandings = sanitizeData(dStandings);
      await Standing.findOneAndUpdate(
        { season: races[0]?.season || new Date().getFullYear().toString(), type: 'driver' },
        { $set: { data: sanitizedDStandings } },
        { upsert: true }
      );
    }

    if (cStandings.length > 0) {
      const sanitizedCStandings = sanitizeData(cStandings);
      await Standing.findOneAndUpdate(
        { season: races[0]?.season || new Date().getFullYear().toString(), type: 'constructor' },
        { $set: { data: sanitizedCStandings } },
        { upsert: true }
      );
    }
    console.log(`Synced standings to MongoDB.`);

    // 5. Dashboard Extras
    // Compute Next and Last race to fetch relevant extras
    const now = new Date();
    const nextRace = races.find((r: any) => new Date(`${r.date}T${r.time || '00:00:00Z'}`) > now) || races[races.length - 1];
    let lastRace = null;
    const pastRaces = races.filter((r: any) => new Date(`${r.date}T${r.time || '00:00:00Z'}`) <= now);
    if (pastRaces.length > 0) {
      lastRace = pastRaces[pastRaces.length - 1];
    }

    const circuitId = nextRace?.Circuit?.circuitId;
    const raceName = nextRace?.raceName;
    const season = nextRace?.season;
    const circuitName = nextRace?.Circuit?.circuitName;

    // A. Fastest Pit Stop
    const openf1Pit = await getFastestPitStop().catch(() => null);
    let fastestPitStop = openf1Pit;
    if (!fastestPitStop && lastRace?.season && lastRace?.round) {
      const ergastRes = await axios.get(`${JOLPICA_BASE_URL}/${lastRace.season}/${lastRace.round}/pitstops.json?limit=100`).catch(() => ({ data: null }));
      if (ergastRes.data?.MRData?.RaceTable?.Races?.[0]?.PitStops?.length > 0) {
        const pitStops = ergastRes.data.MRData.RaceTable.Races[0].PitStops;
        const fastest = pitStops.reduce((min: any, p: any) => parseFloat(p.duration) < parseFloat(min.duration) ? p : min);
        fastestPitStop = {
          driver_number: fastest.driverId.replace(/_/g, ' '),
          pit_duration: parseFloat(fastest.duration),
          lap_number: fastest.lap,
          is_ergast_fallback: true
        };
      }
    }
    if (fastestPitStop) {
      await DashboardExtra.findOneAndUpdate(
        { key: 'fastest_pitstop' },
        { $set: { data: sanitizeData(fastestPitStop) } },
        { upsert: true }
      );
    }

    // B. Circuit Stats
    if (circuitId) {
      const circuitStats = await getCircuitStats(circuitId);
      if (circuitStats) {
        await DashboardExtra.findOneAndUpdate(
          { key: `circuit_stats_${circuitId}` },
          { $set: { data: sanitizeData(circuitStats) } },
          { upsert: true }
        );
      }
    }

    // C. Tyre Compounds
    if (raceName && season) {
      const tyres = await getTyreCompounds(raceName, season);
      if (tyres && tyres.length > 0) {
        await DashboardExtra.findOneAndUpdate(
          { key: `tyres_${season}_${nextRace.round}` },
          { $set: { data: tyres } },
          { upsert: true }
        );
      }
    }

    // D. Driver of the Day
    if (lastRace?.raceName && lastRace?.season) {
      const dotd = await getDriverOfTheDay(lastRace.raceName, lastRace.season);
      if (dotd && dotd !== 'Info not available') {
        await DashboardExtra.findOneAndUpdate(
          { key: `dotd_${lastRace.season}_${lastRace.round}` },
          { $set: { data: sanitizeData(dotd) } },
          { upsert: true }
        );
      }
    }

    // E. Previous Form At Circuit
    if (circuitId && season) {
      const prevForm = await getPreviousFormAtCircuit(circuitId, season);
      if (prevForm) {
        await DashboardExtra.findOneAndUpdate(
          { key: `prev_form_${circuitId}_${season}` },
          { $set: { data: sanitizeData(prevForm) } },
          { upsert: true, returnDocument: 'after' }
        );
      }
    }

    // F. Track Data & Lap Record (from CSV dataset)
    if (season && circuitName && circuitId) {
      try {
        const urlsToTry = [
          `https://raw.githubusercontent.com/toUpperCase78/formula1-datasets/master/Formula1_${season}Season_Calendar.csv`,
          `https://raw.githubusercontent.com/toUpperCase78/formula1-datasets/master/Formula1_${season}season_calendar.csv`,
          `https://raw.githubusercontent.com/toUpperCase78/formula1-datasets/master/Formula1_${parseInt(season) - 1}Season_Calendar.csv`,
          `https://raw.githubusercontent.com/toUpperCase78/formula1-datasets/master/Formula1_${parseInt(season) - 1}season_calendar.csv`,
          `https://raw.githubusercontent.com/toUpperCase78/formula1-datasets/master/Formula1_2024Season_Calendar.csv`,
          `https://raw.githubusercontent.com/toUpperCase78/formula1-datasets/master/Formula1_2024season_calendar.csv`
        ];
        let csvData = null;
        for (const url of urlsToTry) {
          const response = await axios.get(url, { timeout: 5000 }).catch(() => null);
          if (response && response.status === 200 && response.data) {
            csvData = response.data;
            break;
          }
        }
        if (csvData) {
          const lines = csvData.split('\n').filter((l: string) => l.trim() !== '');
          const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
          
          const lrTimeIdx = headers.indexOf('lap record');
          const lrOwnerIdx = headers.indexOf('record owner');
          const lrYearIdx = headers.indexOf('record year');
          const circuitIdx = headers.indexOf('circuit name');
          const firstGpIdx = headers.indexOf('first gp');
          const lapsIdx = headers.indexOf('number of laps');
          const lengthIdx = headers.indexOf('circuit length(km)');
          const distanceIdx = headers.indexOf('race distance(km)');
          const turnsIdx = headers.indexOf('turns');
          
          if (circuitIdx !== -1) {
            const normalizedId = circuitId.replace(/_/g, ' ').toLowerCase();
            const normalizedName = circuitName.toLowerCase();
            const aliases: Record<string, string> = {
              'imola': 'ferrari',
              'interlagos': 'pace',
              'losail': 'lusail'
            };
            const alias = aliases[circuitId] || normalizedId;

            for (let i = 1; i < lines.length; i++) {
               const cols = lines[i].split(',').map((c: string) => c.replace(/^"|"$/g, '').trim());
               const name = (cols[circuitIdx] || '').toLowerCase();
               
               if (name && (
                 name.includes(normalizedId) || 
                 normalizedId.includes(name) || 
                 name.includes(normalizedName) || 
                 normalizedName.includes(name) ||
                 name.includes(alias)
               )) {
                  const trackData = {
                    lapRecord: cols[lrTimeIdx] && cols[lrTimeIdx] !== 'N/A' ? {
                       time: cols[lrTimeIdx],
                       owner: cols[lrOwnerIdx] || '',
                       year: cols[lrYearIdx] || ''
                    } : null,
                    firstGP: firstGpIdx !== -1 ? cols[firstGpIdx] : null,
                    laps: lapsIdx !== -1 ? cols[lapsIdx] : null,
                    length: lengthIdx !== -1 ? cols[lengthIdx] : null,
                    distance: distanceIdx !== -1 ? cols[distanceIdx] : null,
                    turns: turnsIdx !== -1 ? cols[turnsIdx] : null
                  };
                  
                  await DashboardExtra.findOneAndUpdate(
                    { key: `track_data_${circuitId}_${season}` },
                    { $set: { data: sanitizeData(trackData) } },
                    { upsert: true, returnDocument: 'after' }
                  );
                  break;
               }
            }
          }
        }
      } catch (e) {
        console.error('Error syncing track data from CSV', e);
      }
    }
    
    console.log('Synchronization completed successfully!');
  } catch (error) {
    console.error('Error during synchronization:', error);
  }
};
