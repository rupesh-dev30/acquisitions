import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.status(200).json('Hello from Acquisitions Service');
});

export default app;
