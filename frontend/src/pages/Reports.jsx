import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import transactionAPI from "../services/transactionService.js";
import bookingAPI from "../services/bookingService.js";
import productService from "../services/productService.js";

function Reports() {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("overview");
  const [dateRange, setDateRange] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [transactionStats, setTransactionStats] = useState({});
  const [bookingStats, setBookingStats] = useState({});
  const [productStats, setProductStats] = useState({});
  const [revenueData, setRevenueData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, [reportType, dateRange, startDate, endDate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      // Fetch transaction statistics
      const transactionResponse = await transactionAPI.getTransactionStats();
      setTransactionStats(transactionResponse);

      // Fetch revenue analytics
      const revenueResponse = await transactionAPI.getRevenueAnalytics(
        dateRange
      );
      setRevenueData(revenueResponse.data || []);

      // Fetch recent transactions
      const transactionsResponse = await transactionAPI.getTransactions();
      setTransactions(transactionsResponse.transactions || []);

      // Fetch booking statistics
      const bookingsResponse = await bookingAPI.getBookings();
      setBookings(bookingsResponse.bookings || []);

      // Calculate booking stats
      const bookingStats = calculateBookingStats(
        bookingsResponse.bookings || []
      );
      setBookingStats(bookingStats);

      // Fetch product statistics
      const productsResponse = await productService.getProducts();
      const productStats = calculateProductStats(
        productsResponse.products || []
      );
      setProductStats(productStats);
    } catch (error) {
      toast.error("Failed to fetch report data");
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBookingStats = (bookings) => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const confirmed = bookings.filter((b) => b.status === "confirmed").length;
    const pickedUp = bookings.filter((b) => b.status === "picked_up").length;
    const returned = bookings.filter((b) => b.status === "returned").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;
    const overdue = bookings.filter((b) => b.status === "overdue").length;

    return {
      total,
      pending,
      confirmed,
      pickedUp,
      returned,
      cancelled,
      overdue,
      completionRate: total > 0 ? ((returned / total) * 100).toFixed(1) : 0,
    };
  };

  const calculateProductStats = (products) => {
    const total = products.length;
    const available = products.filter((p) => p.status === "available").length;
    const rented = products.filter((p) => p.status === "rented").length;
    const maintenance = products.filter(
      (p) => p.status === "maintenance"
    ).length;

    return {
      total,
      available,
      rented,
      maintenance,
      utilizationRate: total > 0 ? ((rented / total) * 100).toFixed(1) : 0,
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      completed: "bg-green-500",
      pending: "bg-yellow-500",
      failed: "bg-red-500",
      refunded: "bg-purple-500",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${
          statusColors[status] || "bg-gray-500"
        }`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  const exportReport = async () => {
    try {
      const filters = {
        startDate,
        endDate,
        reportType,
      };

      const blob = await transactionAPI.exportTransactions(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${reportType}-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Report exported successfully");
    } catch (error) {
      toast.error("Failed to export report");
      console.error("Error exporting report:", error);
    }
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
        <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
        <button onClick={exportReport} className="btn btn-primary">
          Export Report
        </button>
      </div>

      {/* Report Controls */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="input"
            >
              <option value="overview">Overview</option>
              <option value="transactions">Transactions</option>
              <option value="bookings">Bookings</option>
              <option value="products">Products</option>
              <option value="revenue">Revenue</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateRange === "custom" && (
            <>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input"
                />
              </div>
            </>
          )}

          <button onClick={fetchReportData} className="btn btn-secondary">
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Dashboard */}
      {reportType === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-white">
                Total Revenue
              </h3>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(transactionStats.totalRevenue || 0)}
              </p>
              <p className="text-sm text-gray-400">
                {transactionStats.revenueGrowth > 0 ? "+" : ""}
                {transactionStats.revenueGrowth || 0}% from last period
              </p>
            </div>
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-white">
                Total Bookings
              </h3>
              <p className="text-2xl font-bold text-blue-400">
                {bookingStats.total}
              </p>
              <p className="text-sm text-gray-400">
                {bookingStats.completionRate}% completion rate
              </p>
            </div>
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-white">
                Active Products
              </h3>
              <p className="text-2xl font-bold text-purple-400">
                {productStats.total}
              </p>
              <p className="text-sm text-gray-400">
                {productStats.utilizationRate}% utilization rate
              </p>
            </div>
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-white">
                Pending Pickups
              </h3>
              <p className="text-2xl font-bold text-yellow-400">
                {bookingStats.pending}
              </p>
              <p className="text-sm text-gray-400">
                {bookingStats.overdue} overdue returns
              </p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Revenue Trend
            </h3>
            <div className="h-64 flex items-end justify-center space-x-2">
              {revenueData.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="bg-blue-500 rounded-t w-8"
                    style={{
                      height: `${
                        (item.amount /
                          Math.max(...revenueData.map((d) => d.amount))) *
                        200
                      }px`,
                    }}
                  ></div>
                  <div className="text-xs text-gray-400 mt-2">
                    {item.period}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Recent Transactions
              </h3>
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex justify-between items-center p-3 bg-gray-800 rounded"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {transaction.customerName}
                      </p>
                      <p className="text-sm text-gray-400">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        {formatCurrency(transaction.amount)}
                      </p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Recent Bookings
              </h3>
              <div className="space-y-3">
                {bookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking._id}
                    className="flex justify-between items-center p-3 bg-gray-800 rounded"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {booking.customerName}
                      </p>
                      <p className="text-sm text-gray-400">
                        {booking.productName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        {formatDate(booking.pickupDate)}
                      </p>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${
                          booking.status === "pending"
                            ? "bg-yellow-500"
                            : booking.status === "picked_up"
                            ? "bg-green-500"
                            : booking.status === "returned"
                            ? "bg-purple-500"
                            : "bg-gray-500"
                        }`}
                      >
                        {booking.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Report */}
      {reportType === "transactions" && (
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Transaction Report
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 text-white">Date</th>
                  <th className="text-left py-3 text-white">Customer</th>
                  <th className="text-left py-3 text-white">Type</th>
                  <th className="text-left py-3 text-white">Amount</th>
                  <th className="text-left py-3 text-white">Status</th>
                  <th className="text-left py-3 text-white">Reference</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction._id}
                    className="border-b border-gray-700 hover:bg-gray-800"
                  >
                    <td className="py-3 text-white">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="py-3 text-white">
                      {transaction.customerName}
                    </td>
                    <td className="py-3 text-white">{transaction.type}</td>
                    <td className="py-3 text-white">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-3">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="py-3 text-white">
                      {transaction.referenceId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bookings Report */}
      {reportType === "bookings" && (
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Booking Report
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
                  <th className="text-left py-3 text-white">Amount</th>
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
                    <td className="py-3 text-white">{booking.productName}</td>
                    <td className="py-3 text-white">
                      {formatDate(booking.pickupDate)}
                    </td>
                    <td className="py-3 text-white">
                      {formatDate(booking.returnDate)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${
                          booking.status === "pending"
                            ? "bg-yellow-500"
                            : booking.status === "picked_up"
                            ? "bg-green-500"
                            : booking.status === "returned"
                            ? "bg-purple-500"
                            : "bg-gray-500"
                        }`}
                      >
                        {booking.status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-white">
                      {formatCurrency(booking.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Report */}
      {reportType === "products" && (
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Product Utilization Report
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-800 rounded">
              <h4 className="text-lg font-semibold text-white">
                Total Products
              </h4>
              <p className="text-2xl font-bold text-blue-400">
                {productStats.total}
              </p>
            </div>
            <div className="p-4 bg-gray-800 rounded">
              <h4 className="text-lg font-semibold text-white">
                Currently Rented
              </h4>
              <p className="text-2xl font-bold text-green-400">
                {productStats.rented}
              </p>
            </div>
            <div className="p-4 bg-gray-800 rounded">
              <h4 className="text-lg font-semibold text-white">
                Utilization Rate
              </h4>
              <p className="text-2xl font-bold text-purple-400">
                {productStats.utilizationRate}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Report */}
      {reportType === "revenue" && (
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Revenue Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                Revenue by Period
              </h4>
              <div className="space-y-3">
                {revenueData.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-800 rounded"
                  >
                    <span className="text-white">{item.period}</span>
                    <span className="text-white font-semibold">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                Revenue Chart
              </h4>
              <div className="h-48 flex items-end justify-center space-x-2">
                {revenueData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="bg-green-500 rounded-t w-6"
                      style={{
                        height: `${
                          (item.amount /
                            Math.max(...revenueData.map((d) => d.amount))) *
                          150
                        }px`,
                      }}
                    ></div>
                    <div className="text-xs text-gray-400 mt-2">
                      {item.period}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
