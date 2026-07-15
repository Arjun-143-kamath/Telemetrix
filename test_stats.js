const axios = require('axios');
async function run() {
  const JOLPICA_BASE_URL = 'http://api.jolpi.ca/ergast/f1';
  let offset = 0;
  const limit = 500; // Jolpica might only support limit=100? Ergast standard limit max is 1000, maybe Jolpi.ca max limit is lower?
  let total = 1;
  let allResults = [];
  
  while (offset < total) {
    const response = await axios.get(`${JOLPICA_BASE_URL}/circuits/spa/results.json?limit=${limit}&offset=${offset}`);
    const data = response.data.MRData;
    total = parseInt(data.total);
    console.log(`Fetched offset ${offset}, total ${total}`);
    if (data.RaceTable.Races && data.RaceTable.Races.length > 0) {
      data.RaceTable.Races.forEach(race => {
        allResults.push(...race.Results);
      });
    }
    offset += limit;
  }
  
  const winCounts = {};
  allResults.forEach(res => {
    if (res.position === "1") {
      const driverName = `${res.Driver.givenName} ${res.Driver.familyName}`;
      winCounts[driverName] = (winCounts[driverName] || 0) + 1;
    }
  });
  console.log(Object.entries(winCounts).sort((a,b) => b[1] - a[1]).slice(0, 5));
}
run();
