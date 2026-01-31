import express from 'express';
import cookieParser from 'cookie-parser';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';

import authRoutes from '#routes/auth.routes.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } })
);

app.get('/', (_req, res) => {
  logger.info('Hello from Acquisitions Service');
  res.status(200).json('Hello from Acquisitions API Service');
});

app.get('/health', (req, res) => {
  res
    .status(200)
    .json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
});

app.get('/api', (req, res) => {
  res.status(200).json('Acquisitions API Service is running');
});

app.use('/api/auth', authRoutes);

export default app;
