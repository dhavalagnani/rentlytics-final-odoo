import api from "./apiService";

// Pricelist API methods
export const pricelistAPI = {
  // Get all pricelists
  getAll: async (page = 1, limit = 10) => {
    const response = await api.get(`/pricelists?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get pricelist by ID
  getById: async (id) => {
    const response = await api.get(`/pricelists/getbyid?id=${id}`);
    return response.data;
  },

  // Create new pricelist
  create: async (pricelistData) => {
    const response = await api.post("/pricelists/create", pricelistData);
    return response.data;
  },

  // Update pricelist
  update: async (id, updateData) => {
    const response = await api.patch("/pricelists/update", {
      id,
      ...updateData,
    });
    return response.data;
  },

  // Delete pricelist
  delete: async (id) => {
    const response = await api.delete("/pricelists/delete", { data: { id } });
    return response.data;
  },

  // Get pricelists by customer type
  getByCustomerType: async (customerType, page = 1, limit = 10) => {
    const response = await api.get(
      `/pricelists/customer-type?customerType=${customerType}&page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Get pricelists by region
  getByRegion: async (region, page = 1, limit = 10) => {
    const response = await api.get(
      `/pricelists/region?region=${region}&page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Get active pricelists
  getActive: async (page = 1, limit = 10) => {
    const response = await api.get(
      `/pricelists/active?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};

// Price Rule API methods
export const priceRuleAPI = {
  // Get all price rules
  getAll: async (page = 1, limit = 10) => {
    const response = await api.get(`/pricerules?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get price rule by ID
  getById: async (id) => {
    const response = await api.get(`/pricerules/getbyid?id=${id}`);
    return response.data;
  },

  // Create new price rule
  create: async (priceRuleData) => {
    const response = await api.post("/pricerules/create", priceRuleData);
    return response.data;
  },

  // Update price rule
  update: async (id, updateData) => {
    const response = await api.patch("/pricerules/update", {
      id,
      ...updateData,
    });
    return response.data;
  },

  // Delete price rule
  delete: async (id) => {
    const response = await api.delete("/pricerules/delete", { data: { id } });
    return response.data;
  },

  // Toggle price rule enabled status
  toggle: async (id) => {
    const response = await api.patch("/pricerules/toggle", { id });
    return response.data;
  },

  // Get price rules by product
  getByProduct: async (productId, page = 1, limit = 10) => {
    const response = await api.get(
      `/pricerules/product?productId=${productId}&page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Get price rules by category
  getByCategory: async (categoryId, page = 1, limit = 10) => {
    const response = await api.get(
      `/pricerules/category?categoryId=${categoryId}&page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Get active price rules
  getActive: async (page = 1, limit = 10) => {
    const response = await api.get(
      `/pricerules/active?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Test price rule evaluation
  test: async (baseRates, bookingData) => {
    const response = await api.post("/pricerules/test", {
      baseRates,
      bookingData,
    });
    return response.data;
  },
};

// Pricing calculation utilities
export const pricingUtils = {
  // Calculate final price with rules applied
  calculatePrice: async (baseRates, productId, categoryId, bookingData) => {
    try {
      const result = await priceRuleAPI.test(baseRates, {
        ...bookingData,
        productId,
        categoryId,
      });
      return result.data;
    } catch (error) {
      console.error("Error calculating price:", error);
      return baseRates; // Return base rates if calculation fails
    }
  },

  // Format currency
  formatCurrency: (amount, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  },

  // Validate pricing data
  validatePricingData: (data) => {
    const errors = [];

    if (!data.name || data.name.trim() === "") {
      errors.push("Name is required");
    }

    if (!data.baseRates) {
      errors.push("Base rates are required");
    } else {
      if (
        typeof data.baseRates.hourly !== "number" ||
        data.baseRates.hourly < 0
      ) {
        errors.push("Hourly rate must be a positive number");
      }
      if (
        typeof data.baseRates.daily !== "number" ||
        data.baseRates.daily < 0
      ) {
        errors.push("Daily rate must be a positive number");
      }
      if (
        typeof data.baseRates.weekly !== "number" ||
        data.baseRates.weekly < 0
      ) {
        errors.push("Weekly rate must be a positive number");
      }
    }

    if (!data.validity || !data.validity.startDate || !data.validity.endDate) {
      errors.push("Validity period is required");
    } else {
      const startDate = new Date(data.validity.startDate);
      const endDate = new Date(data.validity.endDate);
      if (startDate >= endDate) {
        errors.push("End date must be after start date");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

export default { pricelistAPI, priceRuleAPI, pricingUtils };
