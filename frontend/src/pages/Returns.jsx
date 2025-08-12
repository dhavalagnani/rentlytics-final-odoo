import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import bookingAPI from "../services/bookingService.js";

function Returns() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [pickupData, setPickupData] = useState({
    pickupDate: "",
    pickupTime: "",
    pickupLocation: "",
    notes: "",
  });
  const [returnData, setReturnData] = useState({
    returnDate: "",
    returnTime: "",
    returnLocation: "",
    condition: "good",
    notes: "",
  });

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
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

  const handlePickupConfirm = async () => {
    if (!selectedBooking) return;

    try {
      await bookingAPI.confirmPickup(selectedBooking._id, pickupData);
      toast.success("Pickup confirmed successfully");
      setShowPickupModal(false);
      setSelectedBooking(null);
      setPickupData({
        pickupDate: "",
        pickupTime: "",
        pickupLocation: "",
        notes: "",
      });
      fetchBookings(); // Refresh the list
    } catch (error) {
      toast.error("Failed to confirm pickup");
      console.error("Error confirming pickup:", error);
    }
  };

  const handleReturnConfirm = async () => {
    if (!selectedBooking) return;

    try {
      await bookingAPI.confirmReturn(selectedBooking._id, returnData);
      toast.success("Return confirmed successfully");
      setShowReturnModal(false);
      setSelectedBooking(null);
      setReturnData({
        returnDate: "",
        returnTime: "",
        returnLocation: "",
        condition: "good",
        notes: "",
      });
      fetchBookings(); // Refresh the list
    } catch (error) {
      toast.error("Failed to confirm return");
      console.error("Error confirming return:", error);
    }
  };

  const handleCancelBooking = async (bookingId, reason) => {
    try {
      await bookingAPI.cancelBooking(bookingId, reason);
      toast.success("Booking cancelled successfully");
      fetchBookings(); // Refresh the list
    } catch (error) {
      toast.error("Failed to cancel booking");
      console.error("Error cancelling booking:", error);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "bg-yellow-500",
      confirmed: "bg-blue-500",
      picked_up: "bg-green-500",
      returned: "bg-purple-500",
      cancelled: "bg-red-500",
      overdue: "bg-orange-500",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${
          statusColors[status] || "bg-gray-500"
        }`}
      >
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
        <h2 className="text-2xl font-bold text-white">
          Returns & Bookings Management
        </h2>
        <button onClick={fetchBookings} className="btn btn-primary">
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <h3 className="text-lg font-semibold text-white">Total Bookings</h3>
          <p className="text-2xl font-bold text-blue-400">{bookings.length}</p>
        </div>
        <div className="card p-4">
          <h3 className="text-lg font-semibold text-white">Pending Pickup</h3>
          <p className="text-2xl font-bold text-yellow-400">
            {bookings.filter((b) => b.status === "pending").length}
          </p>
        </div>
        <div className="card p-4">
          <h3 className="text-lg font-semibold text-white">Out for Delivery</h3>
          <p className="text-2xl font-bold text-green-400">
            {bookings.filter((b) => b.status === "picked_up").length}
          </p>
        </div>
        <div className="card p-4">
          <h3 className="text-lg font-semibold text-white">Overdue</h3>
          <p className="text-2xl font-bold text-red-400">
            {bookings.filter((b) => b.status === "overdue").length}
          </p>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Active Bookings
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 text-white">Customer</th>
                <th className="text-left py-3 text-white">Product</th>
                <th className="text-left py-3 text-white">Pickup Date</th>
                <th className="text-left py-3 text-white">Return Date</th>
                <th className="text-left py-3 text-white">Status</th>
                <th className="text-left py-3 text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking._id}
                  className="border-b border-gray-700 hover:bg-gray-800"
                >
                  <td className="py-3 text-white">
                    <div>
                      <p className="font-medium">{booking.customerName}</p>
                      <p className="text-sm text-gray-400">
                        {booking.customerEmail}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 text-white">
                    <div>
                      <p className="font-medium">{booking.productName}</p>
                      <p className="text-sm text-gray-400">
                        ₹{booking.totalAmount}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 text-white">
                    {formatDate(booking.pickupDate)}
                  </td>
                  <td className="py-3 text-white">
                    {formatDate(booking.returnDate)}
                  </td>
                  <td className="py-3">{getStatusBadge(booking.status)}</td>
                  <td className="py-3">
                    <div className="flex space-x-2">
                      {booking.status === "pending" && (
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowPickupModal(true);
                          }}
                          className="btn btn-sm btn-primary"
                        >
                          Confirm Pickup
                        </button>
                      )}
                      {booking.status === "picked_up" && (
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowReturnModal(true);
                          }}
                          className="btn btn-sm btn-success"
                        >
                          Confirm Return
                        </button>
                      )}
                      {["pending", "confirmed"].includes(booking.status) && (
                        <button
                          onClick={() =>
                            handleCancelBooking(
                              booking._id,
                              "Cancelled by admin"
                            )
                          }
                          className="btn btn-sm btn-danger"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pickup Confirmation Modal */}
      {showPickupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">
              Confirm Pickup
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Pickup Date
                </label>
                <input
                  type="date"
                  value={pickupData.pickupDate}
                  onChange={(e) =>
                    setPickupData({ ...pickupData, pickupDate: e.target.value })
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
                  value={pickupData.pickupTime}
                  onChange={(e) =>
                    setPickupData({ ...pickupData, pickupTime: e.target.value })
                  }
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Pickup Location
                </label>
                <input
                  type="text"
                  value={pickupData.pickupLocation}
                  onChange={(e) =>
                    setPickupData({
                      ...pickupData,
                      pickupLocation: e.target.value,
                    })
                  }
                  className="input w-full"
                  placeholder="Enter pickup location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Notes
                </label>
                <textarea
                  value={pickupData.notes}
                  onChange={(e) =>
                    setPickupData({ ...pickupData, notes: e.target.value })
                  }
                  className="input w-full"
                  rows="3"
                  placeholder="Any additional notes"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handlePickupConfirm}
                className="btn btn-primary flex-1"
              >
                Confirm Pickup
              </button>
              <button
                onClick={() => setShowPickupModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Confirmation Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">
              Confirm Return
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  value={returnData.returnDate}
                  onChange={(e) =>
                    setReturnData({ ...returnData, returnDate: e.target.value })
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
                  value={returnData.returnTime}
                  onChange={(e) =>
                    setReturnData({ ...returnData, returnTime: e.target.value })
                  }
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Return Location
                </label>
                <input
                  type="text"
                  value={returnData.returnLocation}
                  onChange={(e) =>
                    setReturnData({
                      ...returnData,
                      returnLocation: e.target.value,
                    })
                  }
                  className="input w-full"
                  placeholder="Enter return location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Product Condition
                </label>
                <select
                  value={returnData.condition}
                  onChange={(e) =>
                    setReturnData({ ...returnData, condition: e.target.value })
                  }
                  className="input w-full"
                >
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Notes
                </label>
                <textarea
                  value={returnData.notes}
                  onChange={(e) =>
                    setReturnData({ ...returnData, notes: e.target.value })
                  }
                  className="input w-full"
                  rows="3"
                  placeholder="Any additional notes about the return"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleReturnConfirm}
                className="btn btn-success flex-1"
              >
                Confirm Return
              </button>
              <button
                onClick={() => setShowReturnModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Returns;
