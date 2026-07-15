import mongoose, { Schema, Document } from 'mongoose';

export interface IDriver extends Document {
  driverId: string;
  url: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
  permanentNumber?: string;
  code?: string;
}

const DriverSchema: Schema = new Schema({
  driverId: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  givenName: { type: String, required: true },
  familyName: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  nationality: { type: String, required: true },
  permanentNumber: { type: String },
  code: { type: String }
}, { timestamps: true });

export default mongoose.model<IDriver>('Driver', DriverSchema);
