import { getCircuitStats } from './apps/server/src/services/ergast.service';
import { getTyreCompounds, getDriverOfTheDay } from './apps/server/src/Scrappers/wiki.scraper';

async function test() {
  console.log("Testing CircuitStats...");
  const stats = await getCircuitStats('bahrain');
  console.log("CircuitStats:", stats);

  console.log("Testing TyreCompounds...");
  const tyres = await getTyreCompounds('Bahrain Grand Prix', '2026');
  console.log("Tyres:", tyres);
}
test();
