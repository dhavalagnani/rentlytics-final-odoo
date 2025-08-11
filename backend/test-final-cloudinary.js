import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: "demkiu4xj",
  api_key: "591429751883776",
  api_secret: "Nnm8WjFb_bnwU6KDS6l_kz439TU",
});

console.log('=== FINAL CLOUDINARY INTEGRATION TEST ===');

// Test both product and user image uploads
const testAllCloudinaryFunctions = async () => {
  try {
    console.log('\n=== TESTING PRODUCT IMAGE UPLOAD ===');
    
    // Test product image upload (like in product controller)
    const productBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    const productResult = await new Promise((resolve, reject) => {
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
          if (error) reject(error);
          else resolve(result);
        }
      ).end(productBuffer);
    });
    
    console.log("✅ Product image uploaded successfully!");
    console.log("Public ID:", productResult.public_id);
    console.log("URL:", productResult.secure_url);
    
    // Test profile picture upload (like in user controller)
    console.log('\n=== TESTING PROFILE PICTURE UPLOAD ===');
    
    const profileBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    const profileResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'profile-pictures',
          resource_type: 'image',
          transformation: [
            { width: 400, height: 400, crop: "fill" },
            { quality: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(profileBuffer);
    });
    
    console.log("✅ Profile picture uploaded successfully!");
    console.log("Public ID:", profileResult.public_id);
    console.log("URL:", profileResult.secure_url);
    
    // Test image deletion
    console.log('\n=== TESTING IMAGE DELETION ===');
    
    await cloudinary.uploader.destroy(productResult.public_id);
    console.log("✅ Product image deleted successfully!");
    
    await cloudinary.uploader.destroy(profileResult.public_id);
    console.log("✅ Profile picture deleted successfully!");
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
};

// Run the test
testAllCloudinaryFunctions().then(success => {
  if (success) {
    console.log('\n🎉 ALL CLOUDINARY INTEGRATIONS WORKING PERFECTLY!');
    console.log('✅ Product image uploads work');
    console.log('✅ Profile picture uploads work');
    console.log('✅ Image deletions work');
    console.log('✅ Your server is ready to run!');
  } else {
    console.log('\n❌ Some Cloudinary functions failed.');
    console.log('Please check the error above.');
  }
});
