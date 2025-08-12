import Product from "../models/Product.model.js";

class StockService {
  /**
   * Update product stock status to "with customer" after pickup
   * @param {string} productId - Product ID
   * @param {number} quantity - Quantity picked up
   * @returns {Object} Updated product
   */
  static async markProductAsWithCustomer(productId, quantity = 1) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }

      // Update stock status
      product.status = "with_customer";
      product.availableQuantity = Math.max(
        0,
        product.availableQuantity - quantity
      );
      product.rentedQuantity = (product.rentedQuantity || 0) + quantity;

      await product.save();

      console.log(`✅ Product ${product.name} marked as with customer`);
      return product;
    } catch (error) {
      console.error("Error marking product as with customer:", error);
      throw new Error("Failed to update product stock status");
    }
  }

  /**
   * Update product stock status to "available" after return
   * @param {string} productId - Product ID
   * @param {number} quantity - Quantity returned
   * @returns {Object} Updated product
   */
  static async markProductAsAvailable(productId, quantity = 1) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }

      // Update stock status
      product.status = "available";
      product.availableQuantity = product.availableQuantity + quantity;
      product.rentedQuantity = Math.max(
        0,
        (product.rentedQuantity || 0) - quantity
      );

      await product.save();

      console.log(`✅ Product ${product.name} marked as available`);
      return product;
    } catch (error) {
      console.error("Error marking product as available:", error);
      throw new Error("Failed to update product stock status");
    }
  }

  /**
   * Check if product is available for booking
   * @param {string} productId - Product ID
   * @param {number} quantity - Required quantity
   * @returns {boolean} Availability status
   */
  static async isProductAvailable(productId, quantity = 1) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        return false;
      }

      return (
        product.status === "available" && product.availableQuantity >= quantity
      );
    } catch (error) {
      console.error("Error checking product availability:", error);
      return false;
    }
  }

  /**
   * Get product stock information
   * @param {string} productId - Product ID
   * @returns {Object} Stock information
   */
  static async getProductStockInfo(productId) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }

      return {
        productId: product._id,
        name: product.name,
        status: product.status,
        availableQuantity: product.availableQuantity,
        rentedQuantity: product.rentedQuantity || 0,
        totalQuantity:
          product.availableQuantity + (product.rentedQuantity || 0),
      };
    } catch (error) {
      console.error("Error getting product stock info:", error);
      throw new Error("Failed to get product stock information");
    }
  }

  /**
   * Reserve product stock for booking
   * @param {string} productId - Product ID
   * @param {number} quantity - Quantity to reserve
   * @returns {Object} Updated product
   */
  static async reserveProductStock(productId, quantity = 1) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }

      if (product.availableQuantity < quantity) {
        throw new Error("Insufficient stock available");
      }

      // Reserve stock by reducing available quantity
      product.availableQuantity = product.availableQuantity - quantity;
      product.reservedQuantity = (product.reservedQuantity || 0) + quantity;

      await product.save();

      console.log(`✅ Reserved ${quantity} units of ${product.name}`);
      return product;
    } catch (error) {
      console.error("Error reserving product stock:", error);
      throw new Error("Failed to reserve product stock");
    }
  }

  /**
   * Release reserved product stock
   * @param {string} productId - Product ID
   * @param {number} quantity - Quantity to release
   * @returns {Object} Updated product
   */
  static async releaseReservedStock(productId, quantity = 1) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }

      // Release reserved stock
      product.availableQuantity = product.availableQuantity + quantity;
      product.reservedQuantity = Math.max(
        0,
        (product.reservedQuantity || 0) - quantity
      );

      await product.save();

      console.log(`✅ Released ${quantity} reserved units of ${product.name}`);
      return product;
    } catch (error) {
      console.error("Error releasing reserved stock:", error);
      throw new Error("Failed to release reserved stock");
    }
  }

  /**
   * Get overall stock statistics
   * @returns {Object} Stock statistics
   */
  static async getStockStatistics() {
    try {
      const stats = await Product.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalAvailable: { $sum: "$availableQuantity" },
            totalRented: { $sum: { $ifNull: ["$rentedQuantity", 0] } },
            totalReserved: { $sum: { $ifNull: ["$reservedQuantity", 0] } },
            availableProducts: {
              $sum: { $cond: [{ $eq: ["$status", "available"] }, 1, 0] },
            },
            rentedProducts: {
              $sum: { $cond: [{ $eq: ["$status", "with_customer"] }, 1, 0] },
            },
            maintenanceProducts: {
              $sum: { $cond: [{ $eq: ["$status", "maintenance"] }, 1, 0] },
            },
          },
        },
      ]);

      return (
        stats[0] || {
          totalProducts: 0,
          totalAvailable: 0,
          totalRented: 0,
          totalReserved: 0,
          availableProducts: 0,
          rentedProducts: 0,
          maintenanceProducts: 0,
        }
      );
    } catch (error) {
      console.error("Error getting stock statistics:", error);
      throw new Error("Failed to get stock statistics");
    }
  }
}

export default StockService;
