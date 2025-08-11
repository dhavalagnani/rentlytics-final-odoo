import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary directly with the credentials
cloudinary.config({
  cloud_name: "demkiu4xj",
  api_key: "591429751883776",
  api_secret: "Nnm8WjFb_bnwU6KDS6l_kz439TU",
});

console.log('=== TESTING CLOUDINARY DIRECT UPLOAD ===');

// Test Cloudinary buffer upload (like in your product controller)
const testBufferUpload = async () => {
  try {
    console.log('\n=== TESTING BUFFER UPLOAD ===');
    
    // Create a simple test image buffer (1x1 pixel PNG)
    const testBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'test-uploads',
            public_id: `test_direct_${Date.now()}`,
            resource_type: "auto",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              console.log("✅ Cloudinary buffer upload successful!");
              console.log("Public ID:", result.public_id);
              console.log("URL:", result.secure_url);
              resolve(result);
            }
          }
        )
        .end(testBuffer);
    });
    
    // Clean up - delete the test image
    await cloudinary.uploader.destroy(result.public_id);
    console.log('✅ Test image deleted');
    
    return true;
  } catch (error) {
    console.error('❌ Cloudinary buffer upload failed:', error.message);
    return false;
  }
};

// Run the test
testBufferUpload().then(success => {
  if (success) {
    console.log('\n🎉 Cloudinary direct upload is working perfectly!');
    console.log('Your product image uploads will work now.');
  } else {
    console.log('\n❌ Cloudinary needs to be configured properly.');
    console.log('Please check your credentials.');
  }
});
