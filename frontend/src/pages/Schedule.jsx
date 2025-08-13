import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import bookingAPI from "../services/bookingService.js";
import productAPI from "../services/productService.js";

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
  const [showBookingDetails, setShowBookingDetails] = useState(false);

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
      const params = new URLSearchParams();
      if (viewMode === "day") {
        params.append("view", "day");
        params.append("date", selectedDate);
      } else if (viewMode === "week") {
        params.append("view", "week");
        const date = new Date(selectedDate);
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        params.append("startDate", startOfWeek.toISOString().split("T")[0]);
        params.append("endDate", endOfWeek.toISOString().split("T")[0]);
      } else if (viewMode === "month") {
        params.append("view", "month");
        const date = new Date(selectedDate);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        params.append("startDate", startOfMonth.toISOString().split("T")[0]);
        params.append("endDate", endOfMonth.toISOString().split("T")[0]);
      }

      const response = await bookingAPI.getScheduleBookings(params);
      setBookings(response.data || []);
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
        startDate: `${newBooking.pickupDate}T${
          newBooking.pickupTime || "00:00"
        }`,
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Calendar navigation functions
  const navigateDate = (direction) => {
    const currentDate = new Date(selectedDate);
    if (viewMode === "day") {
      currentDate.setDate(currentDate.getDate() + direction);
    } else if (viewMode === "week") {
      currentDate.setDate(currentDate.getDate() + direction * 7);
    } else if (viewMode === "month") {
      currentDate.setMonth(currentDate.getMonth() + direction);
    }
    setSelectedDate(currentDate.toISOString().split("T")[0]);
  };

  // Generate calendar days for month view
  const generateCalendarDays = () => {
    const date = new Date(selectedDate);
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    while (currentDate <= lastDay || days.length < 42) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  // Generate week days for week view
  const generateWeekDays = () => {
    const date = new Date(selectedDate);
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Render day view
  const renderDayView = () => {
    const dayBookings = getBookingsForDate(selectedDate);
    const date = new Date(selectedDate);

    return (
      <div className="card p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">
            {date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>
        </div>

        {dayBookings.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <div className="text-4xl mb-2">📅</div>
            <p>No bookings for this day</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dayBookings.map((booking) => (
              <div
                key={booking._id}
                className="border border-border/30 rounded-lg p-4 hover:bg-white/5 cursor-pointer"
                onClick={() => {
                  setSelectedBooking(booking);
                  setShowBookingDetails(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">
                      {booking.productId?.name || "Product"}
                    </h4>
                    <p className="text-white/60 text-sm">
                      {booking.userId?.firstName} {booking.userId?.lastName}
                    </p>
                    <p className="text-white/60 text-sm">
                      {formatTime(booking.startDate.split("T")[1])} -{" "}
                      {formatTime(booking.endDate.split("T")[1])}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${getStatusColor(
                        booking.status
                      )}`}
                    ></div>
                    <span className="text-white/80 text-sm capitalize">
                      {booking.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const weekDays = generateWeekDays();

    return (
      <div className="card p-6">
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const dayBookings = getBookingsForDate(
              day.toISOString().split("T")[0]
            );
            const isToday =
              day.toISOString().split("T")[0] ===
              new Date().toISOString().split("T")[0];

            return (
              <div
                key={index}
                className={`min-h-[200px] p-3 rounded-lg border ${
                  isToday
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-border/30"
                }`}
              >
                <div className="text-center mb-2">
                  <div
                    className={`text-sm font-medium ${
                      isToday ? "text-blue-400" : "text-white/60"
                    }`}
                  >
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      isToday ? "text-blue-400" : "text-white"
                    }`}
                  >
                    {day.getDate()}
                  </div>
                </div>

                <div className="space-y-1">
                  {dayBookings.slice(0, 3).map((booking) => (
                    <div
                      key={booking._id}
                      className={`text-xs p-1 rounded cursor-pointer ${getStatusColor(
                        booking.status
                      )}`}
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowBookingDetails(true);
                      }}
                    >
                      <div className="font-medium truncate">
                        {booking.productId?.name || "Product"}
                      </div>
                      <div className="text-xs opacity-80">
                        {formatTime(booking.startDate.split("T")[1])}
                      </div>
                    </div>
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="text-xs text-white/60 text-center">
                      +{dayBookings.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render month view
  const renderMonthView = () => {
    const calendarDays = generateCalendarDays();
    const currentMonth = new Date(selectedDate).getMonth();

    return (
      <div className="card p-6">
        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-white/60 font-medium"
            >
              {day}
            </div>
          ))}

          {calendarDays.map((day, index) => {
            const dayBookings = getBookingsForDate(
              day.toISOString().split("T")[0]
            );
            const isCurrentMonth = day.getMonth() === currentMonth;
            const isToday =
              day.toISOString().split("T")[0] ===
              new Date().toISOString().split("T")[0];

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border border-border/20 rounded-lg ${
                  !isCurrentMonth ? "opacity-30" : ""
                } ${isToday ? "border-blue-500 bg-blue-500/10" : ""}`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isToday
                      ? "text-blue-400"
                      : isCurrentMonth
                      ? "text-white"
                      : "text-white/40"
                  }`}
                >
                  {day.getDate()}
                </div>

                <div className="space-y-1">
                  {dayBookings.slice(0, 2).map((booking) => (
                    <div
                      key={booking._id}
                      className={`text-xs p-1 rounded cursor-pointer ${getStatusColor(
                        booking.status
                      )}`}
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowBookingDetails(true);
                      }}
                    >
                      <div className="truncate font-medium">
                        {booking.productId?.name || "Product"}
                      </div>
                    </div>
                  ))}
                  {dayBookings.length > 2 && (
                    <div className="text-xs text-white/60 text-center">
                      +{dayBookings.length - 2}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Schedule Management</h2>
        <button
          onClick={() => setShowBookingModal(true)}
          className="btn btn-primary"
        >
          New Booking
        </button>
      </div>

      {/* Calendar Controls */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateDate(-1)}
              className="btn btn-secondary"
            >
              ← Previous
            </button>
            <button
              onClick={() =>
                setSelectedDate(new Date().toISOString().split("T")[0])
              }
              className="btn btn-secondary"
            >
              Today
            </button>
            <button
              onClick={() => navigateDate(1)}
              className="btn btn-secondary"
            >
              Next →
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("day")}
              className={`px-4 py-2 rounded-lg ${
                viewMode === "day"
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-white/60"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-4 py-2 rounded-lg ${
                viewMode === "week"
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-white/60"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-4 py-2 rounded-lg ${
                viewMode === "month"
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-white/60"
              }`}
            >
              Month
            </button>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-white">
            {viewMode === "day" &&
              new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            {viewMode === "week" &&
              (() => {
                const weekDays = generateWeekDays();
                return `${weekDays[0].toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })} - ${weekDays[6].toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}`;
              })()}
            {viewMode === "month" &&
              new Date(selectedDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
          </h3>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "day" && renderDayView()}
      {viewMode === "week" && renderWeekView()}
      {viewMode === "month" && renderMonthView()}

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
                    setNewBooking({
                      ...newBooking,
                      customerName: e.target.value,
                    })
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
                    setNewBooking({
                      ...newBooking,
                      customerEmail: e.target.value,
                    })
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
                    setNewBooking({
                      ...newBooking,
                      pickupLocation: e.target.value,
                    })
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
                    setNewBooking({
                      ...newBooking,
                      returnLocation: e.target.value,
                    })
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

      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold text-white mb-4">
              Booking Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  Product
                </label>
                <p className="text-white">{selectedBooking.productId?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  Customer
                </label>
                <p className="text-white">
                  {selectedBooking.userId?.firstName}{" "}
                  {selectedBooking.userId?.lastName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  Status
                </label>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${getStatusColor(
                      selectedBooking.status
                    )}`}
                  ></div>
                  <span className="text-white capitalize">
                    {selectedBooking.status.replace("_", " ")}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  Pickup Date
                </label>
                <p className="text-white">
                  {formatDate(selectedBooking.startDate)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  Return Date
                </label>
                <p className="text-white">
                  {formatDate(selectedBooking.endDate)}
                </p>
              </div>
              {selectedBooking.notes && (
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">
                    Notes
                  </label>
                  <p className="text-white">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowBookingDetails(false)}
                className="btn btn-secondary flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Schedule;
