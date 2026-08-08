import mongoose from 'mongoose';

const raceSchema = new mongoose.Schema({
  season: { type: String, required: true },
  round: { type: String, required: true },
  raceName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String },
  Circuit: { type: mongoose.Schema.Types.Mixed },
  FirstPractice: { type: mongoose.Schema.Types.Mixed },
  SecondPractice: { type: mongoose.Schema.Types.Mixed },
  ThirdPractice: { type: mongoose.Schema.Types.Mixed },
  Qualifying: { type: mongoose.Schema.Types.Mixed },
  Sprint: { type: mongoose.Schema.Types.Mixed },
  SprintQualifying: { type: mongoose.Schema.Types.Mixed },
  // Attached dynamically
  winner: { type: mongoose.Schema.Types.Mixed },
  Results: { type: mongoose.Schema.Types.Mixed }, // from results.json
  QualifyingResults: { type: mongoose.Schema.Types.Mixed } // from qualifying.json
}, {
  timestamps: true
});

// Ensure uniqueness per race per season
raceSchema.index({ season: 1, round: 1 }, { unique: true });

export const Race = mongoose.model('Race', raceSchema);
