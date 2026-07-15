const cheerio = require('cheerio');

async function testScrape() {
  const url = 'https://www.formula1.com/en/racing/2026/Belgium/Circuit.html';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    
    // Use regex to find any URL in the raw HTML that looks like a circuit map
    const regex = /https:\/\/media\.formula1\.com\/image\/upload\/[^"'\s]*?(?:circuit|track|map)[^"'\s]*?\.(?:png|jpg|webp|avif)/gi;
    const matches = [...new Set(html.match(regex))];
    
    console.log('Regex Matches for Circuit Maps:', matches);
    
    if (matches.length === 0) {
      console.log('No matches found. Checking if page redirected or is blocked.');
      console.log(html.substring(0, 500));
    }
  } catch (e) {
    console.error(e);
  }
}

testScrape();
