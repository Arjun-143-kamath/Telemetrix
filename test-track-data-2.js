const axios = require('axios');
(async () => {
  const season = '2025';
  const circuitId = 'zandvoort'; // from Ergast
  
  const urlsToTry = [
    `https://raw.githubusercontent.com/toUpperCase78/formula1-datasets/master/Formula1_${season}Season_Calendar.csv`,
    `https://raw.githubusercontent.com/toUpperCase78/formula1-datasets/master/Formula1_${season}season_calendar.csv`
  ];
  let csvData = null;
  for (const url of urlsToTry) {
    const response = await axios.get(url, { timeout: 5000 }).catch(e => null);
    if (response && response.status === 200 && response.data) {
      csvData = response.data;
      break;
    }
  }
  
  if (csvData) {
    const lines = csvData.split('\n').filter((l) => l.trim() !== '');
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const circuitIdx = headers.indexOf('circuit name');
    
    if (circuitIdx !== -1) {
      const normalizedTarget = circuitId.replace(/_/g, ' ').toLowerCase();
      
      for (let i = 1; i < lines.length; i++) {
         const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
         const name = (cols[circuitIdx] || '').toLowerCase();
         
         if (name && (name.includes(normalizedTarget) || normalizedTarget.includes(name))) {
            console.log("MATCH FOUND for", normalizedTarget, "->", name);
            break;
         }
      }
    }
  }
})();
