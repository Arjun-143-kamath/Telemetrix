const axios = require('axios');
const cheerio = require('cheerio');
axios.get('https://en.wikipedia.org/wiki/2024_Bahrain_Grand_Prix', { headers: { 'User-Agent': 'F1RaceHubBot/1.0' } })
  .then(res => {
    const $ = cheerio.load(res.data);
    let dotd = 'Not found';
    $('th').each((i, el) => {
      const text = $(el).text().toLowerCase();
      if (text.includes('driver of the day') || text.includes('driver of the race')) {
         dotd = $(el).next('td').text().trim().replace(/\[\d+\]/g, '');
      }
    });
    console.log("DOTD:", dotd);
  }).catch(e => console.error(e.message));
