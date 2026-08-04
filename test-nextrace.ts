import { getNextRace } from './apps/server/src/services/ergast.service';
getNextRace().then(console.log).catch(console.error);
