import { Router } from 'express';
import { getDriverStandings, getConstructorStandings, getSeasonResults, getQualifyingResults } from '../services/ergast.service';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [driverStandings, constructorStandings, seasonResults, qualifyingResults] = await Promise.all([
      getDriverStandings(),
      getConstructorStandings(),
      getSeasonResults(),
      getQualifyingResults()
    ]);

    // Compute achievements
    const records = {
      mostWins: null as any,
      polePositionKing: null as any,
      podiumFinisher: null as any,
    };

    // 1. Most Wins
    let maxWins = -1;
    driverStandings.forEach((s: any) => {
      const w = parseInt(s.wins);
      if (w > maxWins) {
        maxWins = w;
        records.mostWins = { driver: s.Driver, count: maxWins };
      }
    });

    // 2. Pole Position King
    const poleCounts: Record<string, { count: number, driver: any }> = {};
    qualifyingResults.forEach((race: any) => {
      if (race.QualifyingResults && race.QualifyingResults.length > 0) {
        const p1 = race.QualifyingResults.find((r: any) => r.position === '1');
        if (p1) {
          const id = p1.Driver.driverId;
          if (!poleCounts[id]) poleCounts[id] = { count: 0, driver: p1.Driver };
          poleCounts[id].count++;
        }
      }
    });

    let maxPoles = 0;
    for (const id in poleCounts) {
      if (poleCounts[id] && poleCounts[id].count > maxPoles) {
        maxPoles = poleCounts[id].count;
        records.polePositionKing = { driver: poleCounts[id].driver, count: maxPoles };
      }
    }

    // 3. Podium Finisher
    const podiumCounts: Record<string, { count: number, driver: any }> = {};
    
    seasonResults.forEach((race: any) => {
      if (race.Results) {
        // Podiums
        race.Results.slice(0, 3).forEach((r: any) => {
          const id = r.Driver.driverId;
          if (!podiumCounts[id]) podiumCounts[id] = { count: 0, driver: r.Driver };
          podiumCounts[id].count++;
        });
      }
    });

    let maxPodiums = 0;
    for (const id in podiumCounts) {
      if (podiumCounts[id] && podiumCounts[id].count > maxPodiums) {
        maxPodiums = podiumCounts[id].count;
        records.podiumFinisher = { driver: podiumCounts[id].driver, count: maxPodiums };
      }
    }

    // Build Chart Data for the standings page
    const top5Drivers = driverStandings.slice(0, 5).map((s: any) => s.Driver.driverId);
    const chartData: any[] = [];
    const cumulativePoints: Record<string, number> = {};

    seasonResults.forEach((race: any) => {
      const raceObj: any = { name: race.raceName.replace(' Grand Prix', '') };
      
      if (race.Results) {
        race.Results.forEach((result: any) => {
          const driverId = result.Driver.driverId;
          cumulativePoints[driverId] = (cumulativePoints[driverId] || 0) + parseFloat(result.points);
          if (top5Drivers.includes(driverId)) {
            raceObj[driverId] = cumulativePoints[driverId];
          }
        });
      }
      chartData.push(raceObj);
    });

    // Send the full chart data for the standings page (not sliced to 5)
    res.json({
      driverStandings,
      constructorStandings,
      records,
      chartData // Full season progression
    });
  } catch (error) {
    console.error('Error fetching standings page data:', error);
    res.status(500).json({ message: 'Error fetching standings data', error });
  }
});

export default router;
