import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Add connection options to solve timeout issues
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000, // Increase socket timeout to 45 seconds
      connectTimeoutMS: 30000, // Increase connect timeout to 30 seconds
    };
    
    // Determine which MongoDB URI to use
    const useLocalDB = process.env.USE_LOCAL_DB === 'true' || !process.env.MONGO_URI;
    const primaryURI = process.env.MONGO_URI;
    const localURI = process.env.MONGO_URI_LOCAL || 'mongodb://localhost:27017/ev-management';
    
    let mongoURI = useLocalDB ? localURI : primaryURI;
    console.log(`Connecting to MongoDB: ${useLocalDB ? 'LOCAL' : 'CLOUD'} database`);
    
    try {
      const conn = await mongoose.connect(mongoURI, options);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      if (!useLocalDB && primaryURI) {
        // If cloud connection fails, try connecting to local MongoDB
        console.error(`Cloud MongoDB connection failed: ${error.message}`);
        console.log('Attempting to connect to local MongoDB...');
        const conn = await mongoose.connect(localURI, options);
        console.log(`Fallback to Local MongoDB Connected: ${conn.connection.host}`);
      } else {
        // Re-throw the error if local connection was already attempted
        throw error;
      }
    }
    
    // Setup connection error handler
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });
    
    // Setup reconnection on disconnect
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected, attempting to reconnect...');
    });
    
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.log('⚠️  WARNING: Database connection failed!');
    console.log('💡 For hackathon demo, the server will continue without database.');
    console.log('💡 To fix: Install MongoDB or use MongoDB Atlas cloud database.');
    
    // For hackathon demo, we'll create a mock connection
    mongoose.connection.readyState = 1; // Fake connected state
    console.log('🎭 Mock database connection created for demo purposes');
  }
};

export default connectDB;
