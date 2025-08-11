import Product from "../models/Product.model.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { uploadImageFromBuffer, deleteImage } from "../utils/cloudinary.js";

// Get all products with pagination
export const getProducts = asyncHandler(async (req, res) => {
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

// Create new product (only owners)
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    depositAmount,
    baseRates,
    categoryId,
    unitsAvailable = 1,
  } = req.body;
  const ownerId = req.user._id;

  // Check if user is owner
  if (!req.user.isOwner) {
    return res.status(403).json({
      ok: false,
      message: "Only owners can create products",
    });
  }

  // Validate required fields
  if (!name || !description || !depositAmount || !baseRates || !categoryId) {
    return res.status(400).json({
      ok: false,
      message:
        "Name, description, deposit amount, base rates, and category are required",
    });
  }

  const productData = {
    ownerId,
    categoryId,
    name,
    description,
    depositAmount,
    baseRates,
    unitsAvailable,
  };

  // Handle image upload if provided
  if (req.file) {
    try {
      const uploadResult = await uploadImageFromBuffer(
        req.file.buffer,
        "product-images"
      );
      productData.images = [
        {
          public_id: uploadResult.public_id,
          url: uploadResult.url,
        },
      ];
    } catch (error) {
      console.error("Error uploading product image:", error);
      return res.status(500).json({
        ok: false,
        message: "Failed to upload product image",
      });
    }
  }

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

  // Check if user is owner
  if (!req.user.isOwner) {
    return res.status(403).json({
      ok: false,
      message: "Only owners can update products",
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

  // Handle image upload if provided
  if (req.file) {
    try {
      // Delete old images if they exist
      if (product.images && product.images.length > 0) {
        for (const image of product.images) {
          try {
            await deleteImage(image.public_id);
          } catch (error) {
            console.error("Error deleting old image:", error);
          }
        }
      }

      // Upload new image
      const uploadResult = await uploadImageFromBuffer(
        req.file.buffer,
        "product-images"
      );
      updateData.images = [
        {
          public_id: uploadResult.public_id,
          url: uploadResult.url,
        },
      ];
    } catch (error) {
      console.error("Error uploading product image:", error);
      return res.status(500).json({
        ok: false,
        message: "Failed to upload product image",
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

  // Check if user is owner
  if (!req.user.isOwner) {
    return res.status(403).json({
      ok: false,
      message: "Only owners can delete products",
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
      message: "You can only delete your own products",
    });
  }

  // Delete images from Cloudinary
  if (product.images && product.images.length > 0) {
    for (const image of product.images) {
      try {
        await deleteImage(image.public_id);
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
    const uploadResult = await uploadImageFromBuffer(
      req.file.buffer,
      "product-images"
    );

    // Add new image to existing images array
    const newImage = {
      public_id: uploadResult.public_id,
      url: uploadResult.url,
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
    await deleteImage(imageToRemove.public_id);

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
