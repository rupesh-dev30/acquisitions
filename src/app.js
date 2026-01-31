import express from 'express';
import cookieParser from 'cookie-parser';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } })
);

app.get('/', (req, res) => {
  logger.info('Hello from Acquisitions Service');
  res.status(200).json('Hello from Acquisitions API Service');
});

export default app;
