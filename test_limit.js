const axios = require('axios');
async function run() {
  const JOLPICA_BASE_URL = 'http://api.jolpi.ca/ergast/f1';
  let response = await axios.get(`${JOLPICA_BASE_URL}/circuits/spa/results.json?limit=500&offset=0`);
  let data = response.data.MRData;
  console.log(`Limit: 500, Offset 0 -> Got ${data.RaceTable.Races.length} races`);
  
  let racesCount = 0;
  data.RaceTable.Races.forEach(r => { racesCount += r.Results.length; });
  console.log(`Total Results inside races for offset 0: ${racesCount}`);
}
run();
