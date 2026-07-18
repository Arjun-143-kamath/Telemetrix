import { Router } from 'express';
import { getRaceDetails } from '../controllers/races.controller';

const router = Router();

router.get('/:round', getRaceDetails);

export default router;
