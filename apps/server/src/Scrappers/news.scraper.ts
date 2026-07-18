import axios from 'axios';
import * as cheerio from 'cheerio';
import { withCache } from '../services/cache.service';

export interface NewsArticle {
  title: string;
  url: string;
  imageUrl: string;
  source: string;
  pubDate?: string;
}

// Simple stop words array
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its',
  'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with', 'f1', 'formula', 'one'
]);

// Helper to extract significant words from a headline
const getSignificantWords = (text: string): Set<string> => {
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  return new Set(words.filter(w => w.length > 2 && !STOP_WORDS.has(w)));
};

// Check if two headlines are similar based on word overlap
const areHeadlinesSimilar = (title1: string, title2: string): boolean => {
  const words1 = getSignificantWords(title1);
  const words2 = getSignificantWords(title2);
  
  if (words1.size === 0 || words2.size === 0) return false;
  
  let overlap = 0;
  for (const w of words1) {
    if (words2.has(w)) overlap++;
  }
  
  // If they share 3 or more significant words, or if more than 40% of the shorter headline's words overlap
  const minLength = Math.min(words1.size, words2.size);
  const threshold = Math.min(3, Math.ceil(minLength * 0.4));
  
  return overlap >= threshold;
};

// Scrape F1.com latest news
const scrapeF1News = async (): Promise<NewsArticle[]> => {
  try {
    const res = await axios.get('https://www.formula1.com/en/latest', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    const $ = cheerio.load(res.data);
    const articles: NewsArticle[] = [];

    // F1.com usually wraps news in anchor tags or specific classes, let's try to find generic links to /en/latest/article.
    $('a[href^="/en/latest/article/"]').each((i, el) => {
      const url = `https://www.formula1.com${$(el).attr('href')}`;
      
      // Try to find the title inside the anchor. They often use p tags or spans.
      // Easiest is to look for aria-label or text content.
      const rawText = $(el).text().trim();
      
      // Images are stored in a sibling span containing the img tag
      let imageUrl = $(el).parent().parent().find('img').attr('src') || 
                     $(el).closest('div, li, article, .group, figure').find('img').attr('src') || '';
      
      // Some titles might be embedded in specific classes, we'll extract the longest text block
      const texts = rawText.split('\n').map(s => s.trim()).filter(s => s.length > 15);
      const title = texts.length > 0 ? texts[0] : '';

      // High-res swap if using media.formula1.com
      if (imageUrl && imageUrl.includes('/c_fill,w_352/')) {
        imageUrl = imageUrl.replace('/c_fill,w_352/', '/c_fill,w_976/');
      }

      if (title && imageUrl && !articles.find(a => a.url === url)) {
        articles.push({
          title,
          url,
          imageUrl,
          source: 'F1.com'
        });
      }
    });
    
    return articles;
  } catch (e) {
    console.error('Error scraping F1.com:', e);
    return [];
  }
};

// Scrape Sky Sports F1 RSS for FHD 1920x1080 Images
const scrapeSkySportsNews = async (): Promise<NewsArticle[]> => {
  try {
    const res = await axios.get('https://www.skysports.com/rss/12433', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    // Parse the XML with Cheerio
    const $ = cheerio.load(res.data, { xmlMode: true });
    const articles: NewsArticle[] = [];
    
    $('item').each((i, el) => {
      const title = $(el).find('title').text().trim();
      const url = $(el).find('link').text().trim();
      
      const enclosureNode = $(el).find('enclosure');
      let imageUrl = enclosureNode.attr('url') || '';
      
      const pubDate = $(el).find('pubDate').text().trim();

      // Sky Sports provides 1920x1080 images natively in the enclosure tag
      if (title && url && imageUrl) {
        articles.push({
          title,
          url,
          imageUrl,
          source: 'Sky Sports',
          pubDate
        });
      }
    });
    
    return articles;
  } catch (e) {
    console.error('Error scraping Sky Sports:', e);
    return [];
  }
};

export const getAggregatedNews = async (): Promise<NewsArticle[]> => {
  return withCache('aggregated_news', async () => {
    const [f1News, skyNews] = await Promise.all([
      scrapeF1News(),
      scrapeSkySportsNews()
    ]);
    
    const deduplicatedList = [...f1News]; // F1.com is our primary source
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Add Sky Sports news only if it doesn't match an existing F1.com headline and is within the last 7 days
    for (const skyArticle of skyNews) {
      if (skyArticle.pubDate) {
        const articleDate = new Date(skyArticle.pubDate);
        if (articleDate.getTime() < oneWeekAgo.getTime()) {
          continue; // Skip articles older than 7 days
        }
      }

      let isDuplicate = false;
      for (const existingArticle of deduplicatedList) {
        if (areHeadlinesSimilar(skyArticle.title, existingArticle.title)) {
          isDuplicate = true;
          break;
        }
      }
      
      if (!isDuplicate) {
        deduplicatedList.push(skyArticle);
      }
    }
    
    return deduplicatedList;
  }, 1800); // cache for 30 minutes
};
