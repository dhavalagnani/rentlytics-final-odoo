import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌ MongoDB connection string (MONGO_URI) is missing in environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const fixDatabase = async () => {
  try {
    console.log('🔧 Fixing database indexes...');
    
    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log('Collections found:', collections.map(c => c.name));
    
    // Fix users collection
    if (collections.some(c => c.name === 'users')) {
      console.log('📋 Fixing users collection...');
      
      // Drop all indexes except _id
      await db.collection('users').dropIndexes();
      console.log('✅ Dropped all indexes from users collection');
      
      // Create correct indexes
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      console.log('✅ Created email index');
      
      // List current indexes
      const indexes = await db.collection('users').indexes();
      console.log('📊 Current indexes on users collection:', indexes);
    }
    
    // Fix otps collection
    if (collections.some(c => c.name === 'otps')) {
      console.log('📋 Fixing otps collection...');
      
      // Drop all indexes except _id
      await db.collection('otps').dropIndexes();
      console.log('✅ Dropped all indexes from otps collection');
      
      // Create correct indexes
      await db.collection('otps').createIndex({ userId: 1, isUsed: 1 });
      await db.collection('otps').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
      console.log('✅ Created otps indexes');
      
      // List current indexes
      const indexes = await db.collection('otps').indexes();
      console.log('📊 Current indexes on otps collection:', indexes);
    }
    
    console.log('🎉 Database indexes fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error);
  }
};

const cleanupData = async () => {
  try {
    console.log('🧹 Cleaning up invalid data...');
    
    const db = mongoose.connection.db;
    
    // Remove any documents with null userId in users collection
    const result = await db.collection('users').deleteMany({ userId: { $exists: true } });
    console.log(`🗑️ Removed ${result.deletedCount} invalid user documents`);
    
    // Remove any documents with null userId in otps collection
    const otpResult = await db.collection('otps').deleteMany({ userId: null });
    console.log(`🗑️ Removed ${otpResult.deletedCount} invalid OTP documents`);
    
    console.log('✅ Data cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error cleaning up data:', error);
  }
};

const runFix = async () => {
  console.log('🚀 Starting database fix...');
  
  await connectDB();
  await cleanupData();
  await fixDatabase();
  
  console.log('✅ Database fix completed!');
  process.exit(0);
};

runFix();
