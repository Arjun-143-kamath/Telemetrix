import mongoose, { Schema, Document } from 'mongoose';

export interface ICircuit extends Document {
  circuitId: string;
  url: string;
  circuitName: string;
  Location: {
    lat: string;
    long: string;
    locality: string;
    country: string;
  };
}

const CircuitSchema: Schema = new Schema({
  circuitId: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  circuitName: { type: String, required: true },
  Location: {
    lat: { type: String, required: true },
    long: { type: String, required: true },
    locality: { type: String, required: true },
    country: { type: String, required: true },
  }
}, { timestamps: true });

export default mongoose.model<ICircuit>('Circuit', CircuitSchema);
