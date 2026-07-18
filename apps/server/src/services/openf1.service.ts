import axios from 'axios';
import { withCache } from './cache.service';

const OPENF1_BASE_URL = 'https://api.openf1.org/v1';

export const getLatestSession = async () => {
  return withCache('latest_session', async () => {
    try {
      const response = await axios.get(`${OPENF1_BASE_URL}/sessions?session_key=latest`);
      return response.data[0] || null;
    } catch (error) {
      console.error('Error fetching latest session:', error);
      return null;
    }
  }, 60); // Cache for 60 seconds
};

export const getLatestWeather = async (sessionKey: string | number = 'latest') => {
  return withCache(`weather_${sessionKey}`, async () => {
    try {
      const response = await axios.get(`${OPENF1_BASE_URL}/weather?session_key=${sessionKey}`);
      if (response.data && response.data.length > 0) {
        return response.data[response.data.length - 1]; 
      }
      return null;
    } catch (error) {
      console.error('Error fetching weather:', error);
      return null;
    }
  }, 60); // Cache for 60 seconds
};

export const getFastestPitStop = async (sessionKey: string | number = 'latest') => {
  return withCache(`fastest_pit_${sessionKey}`, async () => {
    try {
      const response = await axios.get(`${OPENF1_BASE_URL}/pit?session_key=${sessionKey}`);
      if (response.data && response.data.length > 0) {
        const validStops = response.data.filter((p: any) => p.pit_duration != null);
        if (validStops.length > 0) {
          return validStops.reduce((fastest: any, current: any) => {
            return current.pit_duration < fastest.pit_duration ? current : fastest;
          });
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching pit stops:', error);
      return null;
    }
  }, 3600); // Cache pit stops longer if it's not live, but 1 hr is safe
};

export const getPracticeClassification = async (sessionKey: string | number) => {
  return withCache(`practice_classification_${sessionKey}`, async () => {
    try {
      // 1. Fetch all drivers for that session
      const driversRes = await axios.get(`${OPENF1_BASE_URL}/drivers?session_key=${sessionKey}`);
      const drivers = driversRes.data;
      
      // 2. Fetch laps to find the fastest lap for each driver
      const lapsRes = await axios.get(`${OPENF1_BASE_URL}/laps?session_key=${sessionKey}`);
      const laps = lapsRes.data;
      
      // Group by driver and find minimum lap time
      const driverBestLaps: Record<string, any> = {};
      for (const lap of laps) {
        if (lap.lap_duration && (!driverBestLaps[lap.driver_number] || lap.lap_duration < driverBestLaps[lap.driver_number].lap_duration)) {
          driverBestLaps[lap.driver_number] = lap;
        }
      }
      
      // Join with drivers and sort
      const classification = drivers.map((d: any) => {
        const bestLap = driverBestLaps[d.driver_number];
        return {
          position: 0,
          driverId: d.name_acronym?.toLowerCase() || d.full_name,
          Driver: {
            givenName: d.first_name,
            familyName: d.last_name,
            code: d.name_acronym,
            permanentNumber: d.driver_number
          },
          Constructor: {
            name: d.team_name
          },
          Time: {
            time: bestLap ? (bestLap.lap_duration / 60 >= 1 ? `${Math.floor(bestLap.lap_duration / 60)}:${(bestLap.lap_duration % 60).toFixed(3).padStart(6, '0')}` : bestLap.lap_duration.toFixed(3)) : 'No time',
            millis: bestLap ? bestLap.lap_duration * 1000 : Infinity
          },
          FastestLap: bestLap ? {
            AverageSpeed: { speed: 'N/A' }, // OpenF1 doesn't directly provide speed here easily
            Time: { time: bestLap.lap_duration.toString() }
          } : null
        };
      }).filter((d: any) => d.Time.millis !== Infinity).sort((a: any, b: any) => a.Time.millis - b.Time.millis);
      
      // Assign positions and gap
      const fastestMillis = classification[0]?.Time.millis || 0;
      classification.forEach((c: any, i: number) => {
        c.position = (i + 1).toString();
        c.points = "0"; // Practice awards no points
        if (i === 0) {
          c.Time.gap = 'Interval';
        } else {
          c.Time.gap = `+${((c.Time.millis - fastestMillis) / 1000).toFixed(3)}`;
        }
      });
      
      return classification;
    } catch (error) {
      console.error(`Error fetching practice classification for session ${sessionKey}:`, error);
      return [];
    }
  }, 3600); // Cache for 1 hour
};

