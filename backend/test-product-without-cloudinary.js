import mongoose from 'mongoose';
import Product from './models/Product.model.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/auth_system');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Test product creation without Cloudinary
const testProductCreationWithoutCloudinary = async () => {
  try {
    console.log('=== TESTING PRODUCT CREATION WITHOUT CLOUDINARY ===');
    
    // Check Cloudinary configuration
    console.log('Cloudinary Configuration:');
    console.log('- CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set');
    console.log('- CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set');
    console.log('- CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set');
    
    // Test data
    const testProductData = {
      productId: `TEST_NO_CLOUDINARY_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      ownerId: new mongoose.Types.ObjectId(), // Create a dummy ObjectId
      categoryId: new mongoose.Types.ObjectId(), // Create a dummy ObjectId
      name: 'Test Product Without Cloudinary',
      description: 'This product was created without Cloudinary configuration',
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
          public_id: `placeholder_${Date.now()}`,
          url: "https://via.placeholder.com/400x300?text=Image+Upload+Disabled"
        }
      ]
    };

    console.log('\nTest product data:', JSON.stringify(testProductData, null, 2));
    
    // Create product
    const product = new Product(testProductData);
    console.log('Product instance created');
    
    // Save product
    const savedProduct = await product.save();
    console.log('✅ Product saved successfully:', savedProduct._id);
    
    // Fetch and verify
    const fetchedProduct = await Product.findById(savedProduct._id);
    console.log('✅ Product fetched successfully');
    console.log('Product name:', fetchedProduct.name);
    console.log('Images field:', fetchedProduct.images);
    console.log('Images type:', typeof fetchedProduct.images);
    console.log('Images is array:', Array.isArray(fetchedProduct.images));
    
    // Clean up
    await Product.findByIdAndDelete(savedProduct._id);
    console.log('✅ Test product deleted');
    
    console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
    console.log('✅ Product creation works without Cloudinary!');
    
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
  await testProductCreationWithoutCloudinary();
  await mongoose.disconnect();
  console.log('✅ Test completed');
};

runTest();
