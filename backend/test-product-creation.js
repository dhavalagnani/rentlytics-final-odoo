import mongoose from 'mongoose';
import Product from './models/Product.model.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Test product creation
const testProductCreation = async () => {
  try {
    console.log('=== TESTING PRODUCT CREATION ===');
    
    // Test data
    const testProductData = {
      productId: `TEST_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      ownerId: new mongoose.Types.ObjectId(), // Create a dummy ObjectId
      categoryId: new mongoose.Types.ObjectId(), // Create a dummy ObjectId
      name: 'Test Product',
      description: 'Test Description',
      depositAmount: 100,
      baseRates: {
        hourly: 10,
        daily: 100,
        weekly: 500
      },
      unitsAvailable: 1,
      rules: {
        minRentalHours: 1,
        maxRentalDays: 30
      },
      availabilityBlocks: [],
      images: [
        {
          public_id: `test_${Date.now()}`,
          url: "https://via.placeholder.com/400x300?text=Test+Image"
        }
      ]
    };

    console.log('Test product data:', JSON.stringify(testProductData, null, 2));
    
    // Create product
    const product = new Product(testProductData);
    console.log('Product instance created');
    
    // Save product
    const savedProduct = await product.save();
    console.log('✅ Product saved successfully:', savedProduct._id);
    
    // Fetch and verify
    const fetchedProduct = await Product.findById(savedProduct._id);
    console.log('✅ Product fetched successfully');
    console.log('Images field:', fetchedProduct.images);
    console.log('Images type:', typeof fetchedProduct.images);
    console.log('Images is array:', Array.isArray(fetchedProduct.images));
    
    // Clean up
    await Product.findByIdAndDelete(savedProduct._id);
    console.log('✅ Test product deleted');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
  }
};

// Run test
const runTest = async () => {
  await connectDB();
  await testProductCreation();
  await mongoose.disconnect();
  console.log('✅ Test completed');
};

runTest();
