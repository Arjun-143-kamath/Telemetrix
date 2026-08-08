import mongoose from 'mongoose';

const dashboardExtraSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g. "fastest_pitstop", "circuit_stats_monza"
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, {
  timestamps: true
});

export const DashboardExtra = mongoose.model('DashboardExtra', dashboardExtraSchema);
