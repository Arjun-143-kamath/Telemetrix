const axios = require('axios');
axios.get('https://api.jolpi.ca/ergast/f1/current.json').then(res => console.log(res.data.MRData.RaceTable.Races.length)).catch(console.error);
