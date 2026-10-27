import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/universe_sentiment';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    isConnected = true;
    console.log(`\n✅ [MongoDB Connected] Host: ${conn.connection.host} | DB: ${conn.connection.name}`);
    console.log(`   You can view and query collections in MongoDB Compass at: mongodb://localhost:27017\n`);
    return conn;
  } catch (error) {
    console.warn(`\n⚠️ [MongoDB Local/Compass Notice] Could not connect to: ${uri}`);
    console.warn(`   Error message: ${error.message}`);
    console.warn('   To use MongoDB Compass:');
    console.warn('   1. Ensure MongoDB Community Server is installed and running locally.');
    console.warn('   2. Open MongoDB Compass and connect to mongodb://127.0.0.1:27017 or mongodb://localhost:27017.');
    console.warn('   Note: The app is currently operating with in-memory session persistence until MongoDB connects.\n');
    return null;
  }
};

export const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

export default connectDB;
