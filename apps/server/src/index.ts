import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
