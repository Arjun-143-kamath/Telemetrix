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
