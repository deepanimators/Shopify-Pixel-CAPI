import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import healthRouter from './api/routes/health';
import eventsRouter from './api/routes/events';
import tenantsRouter from './api/routes/tenants';

dotenv.config();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: ['GET', 'POST'],
  })
);
app.use(express.json());

app.use('/health', healthRouter);
app.use('/api/events', eventsRouter);
app.use('/api/tenants', tenantsRouter);

export default app;
