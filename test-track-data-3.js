const axios = require('axios');
(async () => {
  const ergastRes = await axios.get("https://api.jolpi.ca/ergast/f1/2025.json");
  const circuits = ergastRes.data.MRData.RaceTable.Races.map(r => r.Circuit.circuitId);
  
  const season = '2025';
  const url = `https://raw.githubusercontent.com/toUpperCase78/formula1-datasets/master/Formula1_${season}Season_Calendar.csv`;
  const response = await axios.get(url);
  const lines = response.data.split('\n').filter((l) => l.trim() !== '');
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const circuitIdx = headers.indexOf('circuit name');
  
  const csvCircuits = lines.slice(1).map(l => l.split(',')[circuitIdx].replace(/^"|"$/g, '').trim().toLowerCase());
  
  for (const c of circuits) {
    const normalized = c.replace(/_/g, ' ').toLowerCase();
    const match = csvCircuits.find(name => name.includes(normalized) || normalized.includes(name) || name.replace(/ /g, '').includes(normalized.replace(/ /g, '')));
    if (match) {
      console.log("MATCH", c, "->", match);
    } else {
      console.log("FAIL", c);
    }
  }
})();
