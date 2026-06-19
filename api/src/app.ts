import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import accountRoutes from './routes/accounts.js';
import transferRoutes from './routes/transfers.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transfers', transferRoutes);

// Central error handler — async errors from controllers land here (Express 5).
app.use((err: Error & { statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.statusCode || 500;
  if (status === 500) console.error(err); // only log unexpected ones
  res.status(status).json({ message: err.message || 'Server error' });
});

export default app;
