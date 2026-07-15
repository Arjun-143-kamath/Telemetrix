import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

import routes from './routes';

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Telemetrix API is running' });
});

// MongoDB Connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err: any) => console.error('MongoDB connection error:', err));
} else {
  console.log('No MONGODB_URI provided in .env. Skipping database connection.');
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
