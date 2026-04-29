import mongoose, { type InferSchemaType, type Model } from "mongoose";

const currencySchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    exchangeRate: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export type CurrencyDocument = InferSchemaType<typeof currencySchema>;

export const Currency: Model<CurrencyDocument> =
  mongoose.models.Currency || mongoose.model<CurrencyDocument>("Currency", currencySchema);
