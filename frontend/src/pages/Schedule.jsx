import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import bookingAPI from "../services/bookingService.js";
import productAPI from "../services/productService.js"; // new API service for products

function Schedule() {
  const [bookings, setBookings] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [viewMode, setViewMode] = useState("day");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const [newBooking, setNewBooking] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    productId: "",
    pickupDate: "",
    pickupTime: "",
    returnDate: "",
    returnTime: "",
    pickupLocation: "",
    returnLocation: "",
    notes: "",
  });

  useEffect(() => {
    fetchBookings();
  }, [selectedDate, viewMode]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getBookings();
      setBookings(response.bookings || []);
    } catch (error) {
      toast.error("Failed to fetch bookings");
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await productAPI.getAllProducts();
      setProducts(res.products || []);
    } catch (error) {
      toast.error("Failed to load products");
      console.error(error);
    }
  };

  const handleCreateBooking = async () => {
    try {
      if (!newBooking.productId) {
        toast.error("Please select a product");
        return;
      }

      const payload = {
        productId: newBooking.productId,
        startDate: `${newBooking.pickupDate}T${newBooking.pickupTime || "00:00"}`,
        endDate: `${newBooking.returnDate}T${newBooking.returnTime || "00:00"}`,
        unitCount: 1,
        pickupAddress: newBooking.pickupLocation,
        dropAddress: newBooking.returnLocation,
        notes: newBooking.notes,
      };

      await bookingAPI.createBooking(payload);

      toast.success("Booking created successfully");
      setShowBookingModal(false);
      setNewBooking({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        productId: "",
        pickupDate: "",
        pickupTime: "",
        returnDate: "",
        returnTime: "",
        pickupLocation: "",
        returnLocation: "",
        notes: "",
      });
      fetchBookings();
    } catch (error) {
      toast.error("Failed to create booking");
      console.error("Error creating booking:", error.response?.data || error);
    }
  };

  const getBookingsForDate = (date) =>
    bookings.filter((booking) => {
      const bookingDate = new Date(booking.startDate)
        .toISOString()
        .split("T")[0];
      return bookingDate === date;
    });

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-500",
      confirmed: "bg-blue-500",
      picked_up: "bg-green-500",
      returned: "bg-purple-500",
      cancelled: "bg-red-500",
      overdue: "bg-orange-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // View render functions (Day, Week, Month) unchanged — keep your existing ones
  // I’m omitting them here for brevity, but you’ll keep exactly the same renderDayView, renderWeekView, renderMonthView.

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Schedule Management</h2>
        <button
          onClick={() => setShowBookingModal(true)}
          className="btn btn-primary"
        >
          New Booking
        </button>
      </div>

      {/* Calendar View (Day/Week/Month tabs) — keep existing UI from your file */}

      {/* New Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-4">
              Create New Booking
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Info */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={newBooking.customerName}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, customerName: e.target.value })
                  }
                  className="input w-full"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Customer Email
                </label>
                <input
                  type="email"
                  value={newBooking.customerEmail}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, customerEmail: e.target.value })
                  }
                  className="input w-full"
                  placeholder="Enter customer email"
                />
              </div>

              {/* Product Dropdown */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-1">
                  Select Product
                </label>
                <select
                  value={newBooking.productId}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, productId: e.target.value })
                  }
                  className="input w-full"
                >
                  <option value="">-- Select Product --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates & Locations */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Pickup Date
                </label>
                <input
                  type="date"
                  value={newBooking.pickupDate}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, pickupDate: e.target.value })
                  }
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Pickup Time
                </label>
                <input
                  type="time"
                  value={newBooking.pickupTime}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, pickupTime: e.target.value })
                  }
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  value={newBooking.returnDate}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, returnDate: e.target.value })
                  }
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Return Time
                </label>
                <input
                  type="time"
                  value={newBooking.returnTime}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, returnTime: e.target.value })
                  }
                  className="input w-full"
                />
              </div>

              {/* Addresses */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Pickup Location
                </label>
                <input
                  type="text"
                  value={newBooking.pickupLocation}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, pickupLocation: e.target.value })
                  }
                  className="input w-full"
                  placeholder="Enter pickup location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Return Location
                </label>
                <input
                  type="text"
                  value={newBooking.returnLocation}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, returnLocation: e.target.value })
                  }
                  className="input w-full"
                  placeholder="Enter return location"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-white mb-1">
                Notes
              </label>
              <textarea
                value={newBooking.notes}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, notes: e.target.value })
                }
                className="input w-full"
                rows="3"
                placeholder="Any additional notes"
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateBooking}
                className="btn btn-primary flex-1"
              >
                Create Booking
              </button>
              <button
                onClick={() => setShowBookingModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal — keep your existing code */}
    </div>
  );
}

export default Schedule;
