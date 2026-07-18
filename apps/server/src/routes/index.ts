import { Router } from 'express';
import Driver from '../models/Driver';
import Circuit from '../models/Circuit';
import Race from '../models/Race';
import { getDashboard } from '../controllers/dashboard.controller';
import { getNews } from '../controllers/news.controller';
import standingsRoute from './standings';

import calendarRoute from './calendar';
import racesRoute from './races';

const router = Router();

router.use('/standings', standingsRoute);
router.use('/calendar', calendarRoute);
router.use('/races', racesRoute);

// --- News Aggregator Route ---
router.get('/news', getNews);

// --- Dashboard Aggregator Route ---
router.get('/dashboard', getDashboard);

// --- Driver Routes ---
router.get('/drivers', async (req, res) => {
  try {
    const drivers = await Driver.find({});
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching drivers', error });
  }
});

// --- Circuit Routes ---
router.get('/circuits', async (req, res) => {
  try {
    const circuits = await Circuit.find({});
    res.json(circuits);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching circuits', error });
  }
});

// --- Race Routes ---
router.get('/races', async (req, res) => {
  try {
    const races = await Race.find({}).populate('Circuit');
    res.json(races);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching races', error });
  }
});

export default router;
