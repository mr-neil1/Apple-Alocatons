import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cron from 'node-cron';

import depositRoutes from './routes/deposit.routes';
import withdrawalRoutes from './routes/withdrawal.routes';
import { runPayoutCron } from './cron/payout.cron';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.use('/api/deposit', depositRoutes);
app.use('/api/withdrawal', withdrawalRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

cron.schedule('0 0 * * *', runPayoutCron);

app.listen(PORT, () => {
  console.log(`✅ Backend lancé sur le port ${PORT}`);
});
