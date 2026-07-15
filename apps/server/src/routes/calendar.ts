import { Router } from 'express';
import { getSeasonCalendar, getSeasonResults } from '../services/ergast.service';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [calendar, results] = await Promise.all([
      getSeasonCalendar(),
      getSeasonResults()
    ]);

    // Attach winners to past races to make it easier for the frontend
    const enrichedCalendar = calendar.map((race: any) => {
      const raceResult = results.find((r: any) => r.round === race.round);
      let winner = null;
      if (raceResult && raceResult.Results && raceResult.Results.length > 0) {
        winner = raceResult.Results.find((r: any) => r.position === '1')?.Driver;
      }
      return {
        ...race,
        winner
      };
    });

    res.json(enrichedCalendar);
  } catch (error) {
    console.error('Error fetching calendar:', error);
    res.status(500).json({ message: 'Error fetching calendar data', error });
  }
});

export default router;
