import { Request, Response } from 'express';
import { transfer } from '../services/transferService.js';

export async function createTransfer(req: Request, res: Response): Promise<void> {
  const { fromAccountId, toAccountId, amount } = req.body as {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
  };
  const transaction = await transfer({
    userId: req.userId as string,
    fromAccountId,
    toAccountId,
    amount,
  });
  res.status(201).json({ transaction });
}
