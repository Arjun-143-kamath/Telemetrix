import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/f1-telemetrix';
    await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error}`);
    // Do not exit, as the user will add the URI later
  }
};
