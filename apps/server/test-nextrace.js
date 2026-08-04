const axios = require('axios');

async function getNextRace() {
    try {
      const response = await axios.get(`https://api.jolpi.ca/ergast/f1/current.json`);
      const races = response.data.MRData.RaceTable.Races;
      
      const now = new Date();
      const nextRace = races.find((race) => new Date(`${race.date}T${race.time || '00:00:00Z'}`) > now);
      
      return nextRace || races[races.length - 1];
    } catch (error) {
      console.error('Error fetching next race:', error.message);
      return null;
    }
}
getNextRace().then(res => console.log(res)).catch(console.error);
