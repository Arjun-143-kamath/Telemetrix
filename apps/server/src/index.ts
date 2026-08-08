import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { connectDB } from './config/db';
import { runSync } from './services/sync.service';
import routes from './routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Schedule Sync every 15 minutes
cron.schedule('*/15 * * * *', () => {
  console.log('Running scheduled synchronization...');
  runSync();
});

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
const xss = require('xss-clean');

app.use(helmet());
app.use(xss());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Telemetrix API is running' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
