// Product service for handling product operations
import api from './apiService.js';

class ProductService {
  // Get all products
  async getAllProducts() {
    try {
      // Temporarily return empty array until backend route is created
      return [];
      // const response = await api.get('/api/products');
      // return response.data.products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  // Search products
  async searchProducts(query) {
    try {
      // Temporarily return empty array until backend route is created
      return [];
      // const response = await api.get(`/api/products/search?q=${encodeURIComponent(query)}`);
      // return response.data.products || [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  // Get products by category
  async getProductsByCategory(category) {
    try {
      // Temporarily return empty array until backend route is created
      return [];
      // const response = await api.get(`/api/products/category/${encodeURIComponent(category)}`);
      // return response.data.products || [];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  // Get product by ID
  async getProductById(id) {
    try {
      // Temporarily return null until backend route is created
      return null;
      // const response = await api.get(`/api/products/${id}`);
      // return response.data.product;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  // Create new product (admin only)
  async createProduct(productData) {
    try {
      // Temporarily return success until backend route is created
      return { ok: true };
      // const response = await api.post('/api/products', productData);
      // return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Update product (admin only)
  async updateProduct(id, productData) {
    try {
      // Temporarily return success until backend route is created
      return { ok: true };
      // const response = await api.put(`/api/products/${id}`, productData);
      // return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete product (admin only)
  async deleteProduct(id) {
    try {
      // Temporarily return success until backend route is created
      return { ok: true };
      // const response = await api.delete(`/api/products/${id}`);
      // return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
}

export default new ProductService();
