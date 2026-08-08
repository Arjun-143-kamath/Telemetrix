import { Router } from 'express';
import { runSync } from '../services/sync.service';

const router = Router();

router.post('/', async (req, res) => {
  try {
    // Run sync asynchronously so we don't block the request for too long,
    // or run it synchronously if we want to wait for it.
    // For a manual refresh button, waiting is better so the frontend knows when it's done.
    await runSync();
    res.json({ success: true, message: 'Synchronization complete' });
  } catch (error) {
    console.error('Manual sync failed', error);
    res.status(500).json({ success: false, message: 'Sync failed' });
  }
});

export default router;
