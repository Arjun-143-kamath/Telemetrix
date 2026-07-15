import axios from 'axios';
import { withCache } from './cache.service';

const JOLPICA_BASE_URL = 'http://api.jolpi.ca/ergast/f1';

export const getNextRace = async () => {
  return withCache('next_race', async () => {
    try {
      const response = await axios.get(`${JOLPICA_BASE_URL}/current.json`);
      const races = response.data.MRData.RaceTable.Races;
      
      const now = new Date();
      const nextRace = races.find((race: any) => new Date(`${race.date}T${race.time || '00:00:00Z'}`) > now);
      
      return nextRace || races[races.length - 1];
    } catch (error) {
      console.error('Error fetching next race:', error);
      return null;
    }
  }, 3600 * 6); // Cache for 6 hours
};


export const getDriverStandings = async () => {
  return withCache('driver_standings', async () => {
    try {
      const response = await axios.get(`${JOLPICA_BASE_URL}/current/driverStandings.json`);
      const standingsList = response.data.MRData.StandingsTable.StandingsLists[0];
      return standingsList ? standingsList.DriverStandings : [];
    } catch (error) {
      console.error('Error fetching driver standings:', error);
      return [];
    }
  }, 3600 * 24); // Cache for 24 hours
};

export const getConstructorStandings = async () => {
  return withCache('constructor_standings', async () => {
    try {
      const response = await axios.get(`${JOLPICA_BASE_URL}/current/constructorStandings.json`);
      const standingsList = response.data.MRData.StandingsTable.StandingsLists[0];
      return standingsList ? standingsList.ConstructorStandings : [];
    } catch (error) {
      console.error('Error fetching constructor standings:', error);
      return [];
    }
  }, 3600 * 24); // Cache for 24 hours
};

export const getSeasonResults = async () => {
  return withCache('season_results', async () => {
    try {
      const racesMap = new Map();
      let offset = 0;
      const limit = 100;
      let total = limit;

      while (offset < total) {
        const response = await axios.get(`${JOLPICA_BASE_URL}/current/results.json?limit=${limit}&offset=${offset}`);
        const data = response.data.MRData;
        total = parseInt(data.total);
        if (data.RaceTable.Races && data.RaceTable.Races.length > 0) {
          data.RaceTable.Races.forEach((race: any) => {
            if (racesMap.has(race.round)) {
               const existingRace = racesMap.get(race.round);
               existingRace.Results.push(...race.Results);
            } else {
               racesMap.set(race.round, race);
            }
          });
        }
        offset += limit;
      }
      return Array.from(racesMap.values()).sort((a, b) => parseInt(a.round) - parseInt(b.round));
    } catch (error) {
      console.error('Error fetching season results:', error);
      return [];
    }
  }, 3600 * 24); // Cache for 24 hours
};

export const getQualifyingResults = async () => {
  return withCache('qualifying_results', async () => {
    try {
      const qualyMap = new Map();
      let offset = 0;
      const limit = 100;
      let total = limit;

      while (offset < total) {
        const response = await axios.get(`${JOLPICA_BASE_URL}/current/qualifying.json?limit=${limit}&offset=${offset}`);
        const data = response.data.MRData;
        total = parseInt(data.total);
        if (data.RaceTable.Races && data.RaceTable.Races.length > 0) {
          data.RaceTable.Races.forEach((race: any) => {
            if (qualyMap.has(race.round)) {
               const existingRace = qualyMap.get(race.round);
               existingRace.QualifyingResults.push(...race.QualifyingResults);
            } else {
               qualyMap.set(race.round, race);
            }
          });
        }
        offset += limit;
      }
      return Array.from(qualyMap.values()).sort((a, b) => parseInt(a.round) - parseInt(b.round));
    } catch (error) {
      console.error('Error fetching qualifying results:', error);
      return [];
    }
  }, 3600 * 24); // Cache for 24 hours
};

export const getCircuitStats = async (circuitId: string) => {
  if (!circuitId) return null;
  return withCache(`circuit_stats_${circuitId}`, async () => {
    try {
      let offset = 0;
      const limit = 100; // Jolpica enforces a max limit of 100 per request
      let total = limit;
      let allResults: any[] = [];
      
      // Jolpica fetching for historical results at circuit
      while (offset < total) {
        const response = await axios.get(`${JOLPICA_BASE_URL}/circuits/${circuitId}/results.json?limit=${limit}&offset=${offset}`);
        const data = response.data.MRData;
        total = parseInt(data.total);
        if (data.RaceTable.Races && data.RaceTable.Races.length > 0) {
          data.RaceTable.Races.forEach((race: any) => {
            allResults.push(...race.Results);
          });
        }
        offset += parseInt(data.limit) || limit;
      }

      // Calculate Most Wins
      const winCounts: Record<string, { count: number, name: string }> = {};
      // Calculate Most Poles
      const poleCounts: Record<string, { count: number, name: string }> = {};
      
      let fastestLapTimeMs = Infinity;
      let fastestLapString = 'Info not available';
      
      for (const res of allResults) {
        const driverName = `${res.Driver.givenName.charAt(0)}. ${res.Driver.familyName}`;
        
        if (res.position === "1") {
          if (!winCounts[driverName]) winCounts[driverName] = { count: 0, name: driverName };
          winCounts[driverName].count++;
        }
        
        if (res.grid === "1") {
          if (!poleCounts[driverName]) poleCounts[driverName] = { count: 0, name: driverName };
          poleCounts[driverName].count++;
        }
        
        if (res.FastestLap && res.FastestLap.Time && res.FastestLap.Time.time) {
          const timeStr = res.FastestLap.Time.time;
          // timeStr is usually "1:45.321"
          const parts = timeStr.split(':');
          if (parts.length === 2) {
            const ms = (parseInt(parts[0]) * 60000) + (parseFloat(parts[1]) * 1000);
            if (ms < fastestLapTimeMs) {
              fastestLapTimeMs = ms;
              fastestLapString = timeStr;
            }
          }
        }
      }
      
      const mostWinsDriver = Object.values(winCounts).sort((a, b) => b.count - a.count)[0];
      const mostPolesDriver = Object.values(poleCounts).sort((a, b) => b.count - a.count)[0];
      
      return {
        mostWins: mostWinsDriver ? `${mostWinsDriver.name} (${mostWinsDriver.count})` : 'Info not available',
        mostPoles: mostPolesDriver ? `${mostPolesDriver.name} (${mostPolesDriver.count})` : 'Info not available',
        fastestLap: fastestLapString
      };
    } catch (error) {
      console.error('Error calculating circuit stats:', error);
      return null;
    }
  }, 3600 * 24 * 7); // Cache for 7 days (historical records change rarely)
};
