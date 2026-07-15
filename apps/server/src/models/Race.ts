import mongoose, { Schema, Document } from 'mongoose';

export interface IRace extends Document {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: mongoose.Types.ObjectId;
  date: string;
  time?: string;
}

const RaceSchema: Schema = new Schema({
  season: { type: String, required: true },
  round: { type: String, required: true },
  url: { type: String, required: true },
  raceName: { type: String, required: true },
  Circuit: { type: Schema.Types.ObjectId, ref: 'Circuit', required: true },
  date: { type: String, required: true },
  time: { type: String }
}, { timestamps: true });

// Ensure combination of season and round is unique
RaceSchema.index({ season: 1, round: 1 }, { unique: true });

export default mongoose.model<IRace>('Race', RaceSchema);
