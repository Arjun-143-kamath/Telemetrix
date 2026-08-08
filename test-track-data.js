const axios = require('axios');
(async () => {
  const season = '2025';
  const circuitName = 'Circuit Park Zandvoort';
  const urlsToTry = [
    `https://raw.githubusercontent.com/toUpperCase78/formula1-datasets/master/Formula1_${season}Season_Calendar.csv`,
    `https://raw.githubusercontent.com/toUpperCase78/formula1-datasets/master/Formula1_${season}season_calendar.csv`
  ];
  let csvData = null;
  for (const url of urlsToTry) {
    console.log("Trying", url);
    const response = await axios.get(url, { timeout: 5000 }).catch(e => console.log("Failed", url, e.message));
    if (response && response.status === 200 && response.data) {
      csvData = response.data;
      break;
    }
  }
  if (csvData) {
    console.log("Got CSV. Length:", csvData.length);
    const lines = csvData.split('\n').filter((l) => l.trim() !== '');
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    console.log("Headers:", headers);
    
    const lrTimeIdx = headers.indexOf('lap record');
    const lrOwnerIdx = headers.indexOf('record owner');
    const lrYearIdx = headers.indexOf('record year');
    const circuitIdx = headers.indexOf('circuit name');
    const firstGpIdx = headers.indexOf('first gp');
    const lapsIdx = headers.indexOf('number of laps');
    const lengthIdx = headers.indexOf('circuit length(km)');
    const distanceIdx = headers.indexOf('race distance(km)');
    const turnsIdx = headers.indexOf('turns');
    
    console.log("circuitIdx:", circuitIdx);
    if (circuitIdx !== -1) {
      const normalizedTarget = circuitName.toLowerCase();
      for (let i = 1; i < lines.length; i++) {
         const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
         const name = (cols[circuitIdx] || '').toLowerCase();
         console.log("Comparing", name, "with", normalizedTarget);
         if (name && (name.includes(normalizedTarget) || normalizedTarget.includes(name))) {
            console.log("MATCH FOUND!");
            break;
         }
      }
    }
  } else {
    console.log("No CSV found");
  }
})();
