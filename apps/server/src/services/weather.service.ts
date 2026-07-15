import axios from 'axios';
import { getLatestSession, getLatestWeather } from './openf1.service';

export const getDashboardWeather = async (lat?: number, lon?: number) => {
  try {
    // 1. Check OpenF1 for active session weather
    const latestSession = await getLatestSession();
    
    // We consider it "active" if it's within the last few hours, or just simply fallback to OpenF1 if it exists
    // OpenF1 gives actual track telemetry which is far more accurate for F1 than OpenWeather.
    if (latestSession) {
      const openF1Weather = await getLatestWeather(latestSession.session_key);
      if (openF1Weather) {
        return {
          source: 'OpenF1',
          air_temperature: openF1Weather.air_temperature,
          track_temperature: openF1Weather.track_temperature,
          rainfall: openF1Weather.rainfall, // 0 or 1 usually
          humidity: openF1Weather.humidity,
          wind_speed: openF1Weather.wind_speed,
        };
      }
    }

    // 2. Fallback to OpenWeather API if no live session is happening
    // Require OPENWEATHER_API_KEY in .env
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (apiKey && lat && lon) {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      const response = await axios.get(url);
      return {
        source: 'OpenWeather',
        air_temperature: response.data.main.temp,
        track_temperature: null, // OpenWeather doesn't know track temp
        rainfall: response.data.rain ? response.data.rain['1h'] : 0,
        humidity: response.data.main.humidity,
        wind_speed: response.data.wind.speed,
      };
    }

    // Default fallback if nothing works
    return null;

  } catch (error) {
    console.error('Error in getDashboardWeather:', error);
    return null;
  }
};
