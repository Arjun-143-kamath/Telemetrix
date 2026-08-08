const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: 'apps/server/.env' });
mongoose.connect(process.env.MONGO_URI).then(async () => {
    const races = await mongoose.connection.db.collection('races').find({}).sort({ round: 1 }).toArray();
    const now = new Date();
    const nextRace = races.find((r) => new Date(`${r.date}T${r.time || '00:00:00Z'}`) > now) || races[races.length - 1];
    
    console.log("nextRace season:", nextRace?.season);
    console.log("nextRace circuitId:", nextRace?.Circuit?.circuitId);
    console.log("nextRace circuitName:", nextRace?.Circuit?.circuitName);
    
    process.exit(0);
});
