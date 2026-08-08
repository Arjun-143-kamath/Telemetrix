import { Router } from 'express';
import { Race } from '../models/Race';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear().toString();
    const calendar = await Race.find({ season: currentYear }).lean();
    
    // Sort numerically since round is a string in the schema
    calendar.sort((a: any, b: any) => parseInt(a.round) - parseInt(b.round));

    // The winner and Results are already attached to the Race model via sync service
    res.json(calendar);
  } catch (error) {
    console.error('Error fetching calendar:', error);
    res.status(500).json({ message: 'Error fetching calendar data', error });
  }
});

export default router;
