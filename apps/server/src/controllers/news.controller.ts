import { Request, Response } from 'express';
import { getAggregatedNews } from '../Scrappers/news.scraper';

export const getNews = async (req: Request, res: Response) => {
  try {
    const news = await getAggregatedNews();
    res.json({ news });
  } catch (error) {
    console.error('News fetch error:', error);
    res.status(500).json({ message: 'Error fetching news' });
  }
};
