import mongoose, { Schema, Document, Types, Model } from "mongoose";

export type TransactionType = "deposit" | "withdrawal" | "transfer";
export type TransactionStatus = "completed" | "failed";

export interface ITransaction extends Document {
  type: TransactionType;
  amount: number; // integer pence
  fromAccount?: Types.ObjectId | null;
  toAccount?: Types.ObjectId | null;
  status: TransactionStatus;
  description?: string;
}

const transactionSchema = new Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "transfer"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1, // at least one penny
      validate: {
        validator: Number.isInteger,
        message: "amount must be an integer (pence)",
      },
    },
    fromAccount: { type: Schema.Types.ObjectId, ref: "Account", default: null },
    toAccount: { type: Schema.Types.ObjectId, ref: "Account", default: null },
    status: {
      type: String,
      enum: ["completed", "failed"],
      default: "completed",
    },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

const Transaction = mongoose.model(
  "Transaction",
  transactionSchema
);
export default Transaction;
