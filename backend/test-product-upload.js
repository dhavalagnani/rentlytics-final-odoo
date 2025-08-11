import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with hardcoded credentials (for testing)
cloudinary.config({
  cloud_name: "demkiu4xj",
  api_key: "591429751883776",
  api_secret: "Nnm8WjFb_bnwU6KDS6l_kz439TU",
});

console.log('=== TESTING PRODUCT IMAGE UPLOAD ===');

// Simulate the product controller image upload logic
const testProductImageUpload = async () => {
  try {
    console.log('\n=== SIMULATING PRODUCT IMAGE UPLOAD ===');
    
    // Create a test image buffer (like from multer)
    const testBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    console.log("Uploading image to Cloudinary...");
    
    // Upload image to Cloudinary using buffer (like in product controller)
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'product-images',
          resource_type: 'image',
          transformation: [
            { width: 800, height: 600, crop: "limit" },
            { quality: "auto" },
          ],
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            console.log("✅ Product image uploaded to Cloudinary successfully!");
            console.log("Public ID:", result.public_id);
            console.log("Secure URL:", result.secure_url);
            resolve(result);
          }
        }
      ).end(testBuffer);
    });
    
    // Simulate product data with uploaded image
    const productData = {
      productId: `TEST_PROD_${Date.now()}`,
      name: "Test Product",
      description: "Test product with Cloudinary image",
      images: [
        {
          public_id: result.public_id,
          url: result.secure_url,
        },
      ],
    };
    
    console.log("\n✅ Product data with Cloudinary image:");
    console.log(JSON.stringify(productData, null, 2));
    
    // Clean up - delete the test image
    await cloudinary.uploader.destroy(result.public_id);
    console.log('✅ Test image deleted from Cloudinary');
    
    return true;
  } catch (error) {
    console.error('❌ Product image upload failed:', error.message);
    return false;
  }
};

// Run the test
testProductImageUpload().then(success => {
  if (success) {
    console.log('\n🎉 PRODUCT IMAGE UPLOAD IS WORKING PERFECTLY!');
    console.log('✅ Your product creation with images will work now!');
    console.log('✅ Cloudinary integration is successful!');
  } else {
    console.log('\n❌ Product image upload failed.');
    console.log('Please check the error above.');
  }
});
