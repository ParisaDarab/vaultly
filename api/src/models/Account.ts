import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface IAccount extends Document {
  user: Types.ObjectId;
  accountNumber: string;
  balance: number; // integer pence
  currency: string;
}

const accountSchema = new Schema<IAccount>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    accountNumber: { type: String, required: true, unique: true },
    // Money is stored as an integer number of PENCE — never a float.
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "balance must be an integer (pence)",
      },
    },
    currency: { type: String, default: "GBP" },
  },
  { timestamps: true }
);

const Account = mongoose.model("Account", accountSchema);
export default Account;
