import { Router } from 'express';
import { getSeasonCalendar, getSeasonResults, getQualifyingResults } from '../services/ergast.service';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [calendar, results, qualy] = await Promise.all([
      getSeasonCalendar(),
      getSeasonResults(),
      getQualifyingResults()
    ]);

    // Attach Results and QualifyingResults to the calendar to match frontend expectations
    const completeCalendar = calendar.map((race: any) => {
      const raceResults = results.find((r: any) => r.round === race.round)?.Results || [];
      const raceQualy = qualy.find((r: any) => r.round === race.round)?.QualifyingResults || [];
      
      let winner = null;
      if (raceResults.length > 0) {
        winner = raceResults.find((r: any) => r.position === '1')?.Driver || null;
      }

      return {
        ...race,
        Results: raceResults,
        QualifyingResults: raceQualy,
        winner
      };
    });

    res.json(completeCalendar);
  } catch (error) {
    console.error('Error fetching calendar:', error);
    res.status(500).json({ message: 'Error fetching calendar data', error });
  }
});

export default router;
