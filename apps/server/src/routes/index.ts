import { Router } from 'express';
import { getDashboard } from '../controllers/dashboard.controller';
import { getNews } from '../controllers/news.controller';
import standingsRoute from './standings';
import calendarRoute from './calendar';
import racesRoute from './races';
import syncRoute from './sync';

const router = Router();

router.use('/standings', standingsRoute);
router.use('/calendar', calendarRoute);
router.use('/races', racesRoute);
router.use('/sync', syncRoute);


// --- News Aggregator Route ---
router.get('/news', getNews);

// --- Dashboard Aggregator Route ---
router.get('/dashboard', getDashboard);

export default router;
