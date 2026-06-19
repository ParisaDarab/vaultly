import { Request, Response } from 'express';
import crypto from 'crypto';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

export async function createAccount(req: Request, res: Response): Promise<void> {
  const accountNumber = String(crypto.randomInt(10_000_000, 99_999_999));
  const account = await Account.create({ user: req.userId, accountNumber });
  res.status(201).json({ account });
}

export async function listAccounts(req: Request, res: Response): Promise<void> {
  const accounts = await Account.find({ user: req.userId });
  res.json({ accounts });
}

// Simple deposit so you can fund an account for testing.
export async function deposit(req: Request, res: Response): Promise<void> {
  const { amount } = req.body as { amount: number };
  if (!Number.isInteger(amount) || amount <= 0) {
    res.status(400).json({ message: 'Amount must be a positive integer (pence)' });
    return;
  }
  const account = await Account.findOne({ _id: req.params.id, user: req.userId });
  if (!account) {
    res.status(404).json({ message: 'Account not found' });
    return;
  }
  account.balance += amount;
  await account.save();
  await Transaction.create({ type: 'deposit', amount, toAccount: account._id });
  res.json({ account });
}
