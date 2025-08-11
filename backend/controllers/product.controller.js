import Product from "../models/Product.model.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "demkiu4xj",
  api_key: process.env.CLOUDINARY_API_KEY || "591429751883776",
  api_secret: process.env.CLOUDINARY_API_SECRET || "Nnm8WjFb_bnwU6KDS6l_kz439TU",
});

// Get all products with pagination (excluding current user's products)
export const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Get current user ID from request (if authenticated)
  const currentUserId = req.user?._id;

  // Build query to exclude current user's products
  const query = currentUserId ? { ownerId: { $ne: currentUserId } } : {};

  const products = await Product.find(query)
    .populate("ownerId", "firstName lastName email")
    .populate("categoryId", "name")
    .lean()
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(query);

  res.json({
    ok: true,
    data: {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
    message: "Products retrieved successfully",
  });
});

// Get all products with pagination (public - includes all products)
export const getAllProductsPublic = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const products = await Product.find()
    .populate("ownerId", "firstName lastName email")
    .populate("categoryId", "name")
    .lean()
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments();

  res.json({
    ok: true,
    data: {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
    message: "Products retrieved successfully",
  });
});

// Get product by ID
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id)
    .populate("ownerId", "firstName lastName email")
    .populate("categoryId", "name")
    .lean();

  if (!product) {
    return res.status(404).json({
      ok: false,
      message: "Product not found",
    });
  }

  res.json({
    ok: true,
    data: product,
    message: "Product retrieved successfully",
  });
});

// Get products by category
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const currentUserId = req.user?._id;

  try {
    let query = { categoryId };
    
    // If user is authenticated, exclude their own products
    if (currentUserId) {
      query.ownerId = { $ne: currentUserId };
    }

    const products = await Product.find(query)
      .populate("ownerId", "firstName lastName")
      .populate("categoryId", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      ok: true,
      data: {
        products,
        count: products.length
      },
      message: "Products filtered by category successfully",
    });
  } catch (error) {
    console.error('Error filtering products by category:', error);
    res.status(500).json({
      ok: false,
      message: "Failed to filter products by category",
    });
  }
});

// Search products by name, category, and price
export const searchProducts = asyncHandler(async (req, res) => {
  const { q: searchQuery, category, minPrice, maxPrice } = req.query;
  const currentUserId = req.user?._id;

  try {
    let query = {};
    
    // If user is authenticated, exclude their own products
    if (currentUserId) {
      query.ownerId = { $ne: currentUserId };
    }

    // Search by product name or description
    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      query.categoryId = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.$or = query.$or || [];
      
      // Search in baseRates (hourly, daily, weekly)
      const priceQuery = {};
      if (minPrice) {
        priceQuery.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        priceQuery.$lte = parseFloat(maxPrice);
      }
      
      if (Object.keys(priceQuery).length > 0) {
        query.$or.push(
          { 'baseRates.hourly': priceQuery },
          { 'baseRates.daily': priceQuery },
          { 'baseRates.weekly': priceQuery }
        );
      }
    }

    const products = await Product.find(query)
      .populate("ownerId", "firstName lastName")
      .populate("categoryId", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      ok: true,
      data: {
        products,
        count: products.length
      },
      message: "Products searched successfully",
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      ok: false,
      message: "Failed to search products",
    });
  }
});

// Create new product (only owners)
export const createProduct = asyncHandler(async (req, res) => {
  console.log("=== CREATE PRODUCT DEBUG ===");
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  console.log("Request file:", req.file ? "File present" : "No file");
  console.log("================================");
  
  const {
    name,
    description,
    depositAmount,
    baseRates,
    categoryId,
    unitsAvailable = 1,
    rules,
    availabilityBlocks = [],
  } = req.body;
  // const ownerId = req.user._id;

  // Parse JSON strings if they come as strings
  let parsedBaseRates = baseRates;
  let parsedRules = rules;
  let parsedAvailabilityBlocks = availabilityBlocks;

  try {
    if (typeof baseRates === 'string') {
      parsedBaseRates = JSON.parse(baseRates);
      console.log("Parsed baseRates:", parsedBaseRates);
    }
    if (typeof rules === 'string') {
      parsedRules = JSON.parse(rules);
      console.log("Parsed rules:", parsedRules);
    }
    if (typeof availabilityBlocks === 'string') {
      parsedAvailabilityBlocks = JSON.parse(availabilityBlocks);
      console.log("Parsed availabilityBlocks:", parsedAvailabilityBlocks);
    }
  } catch (error) {
    console.error('Error parsing JSON fields:', error);
    return res.status(400).json({
      ok: false,
      message: 'Invalid JSON format in request fields',
    });
  }

  // Check if user is owner
  // if (!req.user.isOwner) {
  //   return res.status(403).json({
  //     ok: false,
  //     message: "Only owners can create products",
  //   });
  // }

  // Validate required fields
  if (!name || !description || !categoryId) {
    return res.status(400).json({
      ok: false,
      message: "Name, description, and category are required",
    });
  }

  // Generate a unique productId
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const productId = `PROD_${timestamp}_${randomSuffix}`;

  // Initialize product data
  const productData = {
    productId,
    ownerId: req.user._id,
    categoryId,
    name,
    description,
    depositAmount: depositAmount || 0,
    baseRates: parsedBaseRates || { hourly: 0, daily: 0, weekly: 0 },
    unitsAvailable,
    rules: parsedRules || { minRentalHours: 1, maxRentalDays: 30 },
    availabilityBlocks: parsedAvailabilityBlocks,
    images: [],
  };

  // Handle image upload if provided
  if (req.file) {
    try {
      console.log("=== UPLOADING IMAGE TO CLOUDINARY ===");
      
      // Upload image to Cloudinary using buffer
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
              console.log("✅ Image uploaded to Cloudinary successfully!");
              console.log("Public ID:", result.public_id);
              console.log("Secure URL:", result.secure_url);
              resolve(result);
            }
          }
        ).end(req.file.buffer);
      });
      
      productData.images = [
        {
          public_id: result.public_id,
          url: result.secure_url,
        },
      ];
      
    } catch (error) {
      console.error("❌ Error uploading image to Cloudinary:", error.message);
      
      if (error.message.includes('Must supply api_key')) {
        return res.status(500).json({
          ok: false,
          message: "Image upload service not configured. Please check Cloudinary credentials.",
        });
      }
      
      return res.status(500).json({
        ok: false,
        message: "Failed to upload image. Please try again.",
      });
    }
  }

  // Create and save the product
  console.log("Final productData before saving:", JSON.stringify(productData, null, 2));
  const product = new Product(productData);
  await product.save();

  const populatedProduct = await Product.findById(product._id)
    .populate("ownerId", "firstName lastName email")
    .populate("categoryId", "name");

  res.status(201).json({
    ok: true,
    data: populatedProduct,
    message: "Product created successfully",
  });
});

// Update product (only owners)
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // // Check if user is owner
  // if (!req.user.isOwner) {
  //   return res.status(403).json({
  //     ok: false,
  //     message: "Only owners can update products",
  //   });
  // }

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({
      ok: false,
      message: "Product not found",
    });
  }

  // Ensure user owns this product
  if (product.ownerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      ok: false,
      message: "You can only update your own products",
    });
  }

  // Handle image upload if provided
  if (req.file) {
    try {
      console.log("=== UPLOADING UPDATED IMAGE TO CLOUDINARY ===");
      
      // Delete old images if they exist
      if (product.images && product.images.length > 0) {
        for (const image of product.images) {
          try {
            await cloudinary.uploader.destroy(image.public_id);
            console.log("✅ Deleted old image:", image.public_id);
          } catch (error) {
            console.error("Error deleting old image:", error);
          }
        }
      }

      // Upload new image to Cloudinary using buffer
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
              console.log("✅ Updated image uploaded to Cloudinary successfully!");
              console.log("Public ID:", result.public_id);
              console.log("Secure URL:", result.secure_url);
              resolve(result);
            }
          }
        ).end(req.file.buffer);
      });
      
      updateData.images = [
        {
          public_id: result.public_id,
          url: result.secure_url,
        },
      ];
      
    } catch (error) {
      console.error("❌ Error uploading updated image to Cloudinary:", error.message);
      
      if (error.message.includes('Must supply api_key')) {
        return res.status(500).json({
          ok: false,
          message: "Image upload service not configured. Please check Cloudinary credentials.",
        });
      }
      
      return res.status(500).json({
        ok: false,
        message: "Failed to upload updated image. Please try again.",
      });
    }
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("ownerId", "firstName lastName email")
    .populate("categoryId", "name");

  res.json({
    ok: true,
    data: updatedProduct,
    message: "Product updated successfully",
  });
});

// Delete product (only owners)
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // // Check if user is owner
  // if (!req.user.isOwner) {
  //   return res.status(403).json({
  //     ok: false,
  //     message: "Only owners can delete products",
  //   });
  // }

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({
      ok: false,
      message: "Product not found",
    });
  }

  // Ensure user owns this product
  if (product.ownerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      ok: false,
      message: "You can only delete your own products",
    });
  }

  // Delete images from Cloudinary
  if (product.images && product.images.length > 0) {
    for (const image of product.images) {
      try {
        await cloudinary.uploader.destroy(image.public_id);
        console.log("✅ Deleted image from Cloudinary:", image.public_id);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
    }
  }

  await Product.findByIdAndDelete(id);

  res.json({
    ok: true,
    message: "Product deleted successfully",
  });
});

// Update product units available
export const updateUnitsAvailable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { unitsAvailable } = req.body;

  const product = await Product.findByIdAndUpdate(
    id,
    { unitsAvailable },
    { new: true, runValidators: true }
  )
    .populate("ownerId", "firstName lastName email")
    .populate("categoryId", "name");

  if (!product) {
    return res.status(404).json({
      ok: false,
      message: "Product not found",
    });
  }

  res.json({
    ok: true,
    data: product,
    message: "Product units updated successfully",
  });
});

// Get products by owner
export const getProductsByOwner = asyncHandler(async (req, res) => {
  const { ownerId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const products = await Product.find({ ownerId })
    .populate("categoryId", "name")
    .lean()
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments({ ownerId });

  res.json({
    ok: true,
    data: {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
    message: "Owner products retrieved successfully",
  });
});

// Get current user's products
export const getMyProducts = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const products = await Product.find({ ownerId: currentUserId })
    .populate("categoryId", "name")
    .lean()
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments({ ownerId: currentUserId });

  res.json({
    ok: true,
    data: {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
    message: "My products retrieved successfully",
  });
});

// Add product image
export const addProductImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({
      ok: false,
      message: "Image file is required",
    });
  }

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({
      ok: false,
      message: "Product not found",
    });
  }

  // Ensure user owns this product
  if (product.ownerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      ok: false,
      message: "You can only update your own products",
    });
  }

  try {
    console.log("=== UPLOADING ADDITIONAL IMAGE TO CLOUDINARY ===");
    
    // Upload image to Cloudinary using buffer
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
            console.log("✅ Additional image uploaded to Cloudinary successfully!");
            console.log("Public ID:", result.public_id);
            console.log("Secure URL:", result.secure_url);
            resolve(result);
          }
        }
      ).end(req.file.buffer);
    });

    // Add new image to existing images array
    const newImage = {
      public_id: result.public_id,
      url: result.secure_url,
    };

    product.images = product.images || [];
    product.images.push(newImage);
    await product.save();

    res.json({
      ok: true,
      data: {
        image: newImage,
        totalImages: product.images.length,
      },
      message: "Product image added successfully",
    });
  } catch (error) {
    console.error("Error uploading product image:", error);
    res.status(500).json({
      ok: false,
      message: "Failed to upload product image",
    });
  }
});

// Remove product image
export const removeProductImage = asyncHandler(async (req, res) => {
  const { id, imageIndex } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({
      ok: false,
      message: "Product not found",
    });
  }

  // Ensure user owns this product
  if (product.ownerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      ok: false,
      message: "You can only update your own products",
    });
  }

  const imageIndexNum = parseInt(imageIndex);
  if (
    !product.images ||
    imageIndexNum < 0 ||
    imageIndexNum >= product.images.length
  ) {
    return res.status(400).json({
      ok: false,
      message: "Invalid image index",
    });
  }

  const imageToRemove = product.images[imageIndexNum];

  try {
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(imageToRemove.public_id);
    console.log("✅ Deleted image from Cloudinary:", imageToRemove.public_id);

    // Remove from array
    product.images.splice(imageIndexNum, 1);
    await product.save();

    res.json({
      ok: true,
      message: "Product image removed successfully",
    });
  } catch (error) {
    console.error("Error removing product image:", error);
    res.status(500).json({
      ok: false,
      message: "Failed to remove product image",
    });
  }
});
