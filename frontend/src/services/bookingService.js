import api from "./apiService.js";

// Booking API methods
export const bookingAPI = {
  // Get all bookings
  getBookings: async () => {
    try {
      const response = await api.get("/bookings");
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching bookings:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    try {
      const response = await api.get(
        `/bookings/getbyid?bookingId=${bookingId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching booking:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Get bookings by user
  getBookingsByUser: async (userId) => {
    try {
      const response = await api.get(`/bookings/getbyuser?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching user bookings:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Get bookings by stage
  getBookingsByStage: async (stage) => {
    try {
      const response = await api.get(`/bookings/stage/${stage}`);
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching bookings by stage:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Create new booking
  createBooking: async (bookingData) => {
    try {
      const response = await api.post("/bookings/create", bookingData);
      return response.data;
    } catch (error) {
      console.error(
        "Error creating booking:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Update booking
  updateBooking: async (bookingData) => {
    try {
      const response = await api.patch("/bookings/update", bookingData);
      return response.data;
    } catch (error) {
      console.error(
        "Error updating booking:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId, reason) => {
    try {
      const response = await api.patch("/bookings/cancel", {
        bookingId,
        reason,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error canceling booking:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Confirm pickup
  confirmPickup: async (bookingId, pickupData) => {
    try {
      const response = await api.post(
        `/bookings/${bookingId}/pickup/confirm`,
        pickupData
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error confirming pickup:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Confirm return
  confirmReturn: async (bookingId, returnData) => {
    try {
      const response = await api.post(
        `/bookings/${bookingId}/return/confirm`,
        returnData
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error confirming return:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Get booking statistics
  getBookingStats: async () => {
    try {
      const response = await api.get("/bookings/stats");
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching booking stats:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export default bookingAPI;
