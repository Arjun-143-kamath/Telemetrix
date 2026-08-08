import mongoose from 'mongoose';

const standingSchema = new mongoose.Schema({
  season: { type: String, required: true },
  type: { type: String, enum: ['driver', 'constructor'], required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  achievements: { type: mongoose.Schema.Types.Mixed } // Attached for overall convenience
}, {
  timestamps: true
});

standingSchema.index({ season: 1, type: 1 }, { unique: true });

export const Standing = mongoose.model('Standing', standingSchema);
