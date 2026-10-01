import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri && process.env.NODE_ENV === 'production') {
      throw new Error('[FATAL SECURITY ERROR]: MONGODB_URI (or MONGO_URI) environment variable is required in production.');
    }
    const conn = await mongoose.connect(mongoUri || 'mongodb://localhost:27017/google_docs_clone', {
      dbName: 'google_docs_clone',
      serverSelectionTimeoutMS: 10000
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
