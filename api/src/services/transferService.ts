import mongoose from 'mongoose';
import Account from '../models/Account.js';
import Transaction, { ITransaction } from '../models/Transaction.js';
import { AppError } from '../utils/AppError.js';

interface TransferParams {
  userId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number; // integer pence, must be > 0
}

/**
 * Move money between two accounts, atomically.
 * Either every step commits, or none do.
 */
export async function transfer({
  userId,
  fromAccountId,
  toAccountId,
  amount,
}: TransferParams): Promise<ITransaction> {
  // 1. Validate inputs first — fail fast, no DB work needed.
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new AppError('Amount must be a positive whole number of pence', 400);
  }
  if (String(fromAccountId) === String(toAccountId)) {
    throw new AppError('Cannot transfer to the same account', 400);
  }

  const session = await mongoose.startSession();
  try {
    let transaction: ITransaction | undefined;

    await session.withTransaction(async () => {
      // 2. Source must exist and belong to the caller.
      const from = await Account.findById(fromAccountId).session(session);
      if (!from) throw new AppError('Source account not found', 404);
      if (String(from.user) !== String(userId)) {
        throw new AppError('You do not own the source account', 403);
      }

      // 3. Destination must exist.
      const to = await Account.findById(toAccountId).session(session);
      if (!to) throw new AppError('Destination account not found', 404);

      // 4. Debit the source — GUARDED so it can never go negative,
      //    even if two transfers run at the same time.
      const debit = await Account.updateOne(
        { _id: fromAccountId, balance: { $gte: amount } },
        { $inc: { balance: -amount } },
        { session }
      );
      if (debit.modifiedCount === 0) {
        throw new AppError('Insufficient funds', 400);
      }

      // 5. Credit the destination.
      await Account.updateOne(
        { _id: toAccountId },
        { $inc: { balance: amount } },
        { session }
      );

      // 6. Record it in the ledger. (create with a session needs the array form.)
      const created = await Transaction.create(
        [
          {
            type: 'transfer',
            amount,
            fromAccount: fromAccountId,
            toAccount: toAccountId,
            status: 'completed',
          },
        ],
        { session }
      );
      transaction = created[0];
    });

    return transaction!; // guaranteed set if withTransaction didn't throw
  } finally {
    await session.endSession();
  }
}
