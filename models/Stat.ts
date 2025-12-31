import mongoose, { Schema, models } from "mongoose";

const StatSchema = new Schema(
  {
    key: { type: String, unique: true, required: true }, // e.g. "site_visits"
    value: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Stat = models.Stat || mongoose.model("Stat", StatSchema);
