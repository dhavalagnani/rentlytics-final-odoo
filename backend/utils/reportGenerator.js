/**
 * Generate CSV content from dashboard data
 * @param {Object} dashboardData - Dashboard data object
 * @returns {string} CSV formatted string
 */
export const generateDashboardCSV = (dashboardData) => {
  const {
    totalBookings,
    totalAmountSpent,
    totalActiveRentals,
    mostRentedProducts,
    lateReturnsCount,
    userInfo,
  } = dashboardData;

  // Create CSV headers
  const headers = [
    "User Name",
    "Email",
    "Total Bookings",
    "Total Amount Spent",
    "Active Rentals",
    "Late Returns",
    "Most Rented Products",
    "Report Date",
  ];

  // Create CSV data row
  const data = [
    `${userInfo.firstName} ${userInfo.lastName}`,
    userInfo.email,
    totalBookings,
    `₹${totalAmountSpent.toFixed(2)}`,
    totalActiveRentals,
    lateReturnsCount,
    mostRentedProducts.map((p) => `${p.name} (${p.count})`).join(", "),
    new Date().toISOString().split("T")[0],
  ];

  // Combine headers and data
  const csvContent = [
    headers.join(","),
    data.map((field) => `"${field}"`).join(","),
  ].join("\n");

  return csvContent;
};

/**
 * Generate detailed bookings CSV
 * @param {Array} bookings - Array of booking objects
 * @returns {string} CSV formatted string
 */
export const generateBookingsCSV = (bookings) => {
  const headers = [
    "Booking ID",
    "Product Name",
    "Start Date",
    "End Date",
    "Duration (Days)",
    "Total Amount",
    "Status",
    "Payment Status",
    "Created Date",
  ];

  const rows = bookings.map((booking) => [
    booking._id,
    booking.product?.name || "N/A",
    new Date(booking.startDate).toISOString().split("T")[0],
    new Date(booking.endDate).toISOString().split("T")[0],
    Math.ceil(
      (new Date(booking.endDate) - new Date(booking.startDate)) /
        (1000 * 60 * 60 * 24)
    ),
    `₹${booking.totalAmount?.toFixed(2) || "0.00"}`,
    booking.status,
    booking.paymentStatus || "Pending",
    new Date(booking.createdAt).toISOString().split("T")[0],
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((field) => `"${field}"`).join(",")),
  ].join("\n");

  return csvContent;
};

/**
 * Generate transactions CSV
 * @param {Array} transactions - Array of transaction objects
 * @returns {string} CSV formatted string
 */
export const generateTransactionsCSV = (transactions) => {
  const headers = [
    "Transaction ID",
    "Order ID",
    "Amount",
    "Payment Method",
    "Status",
    "Stripe Payment Intent ID",
    "Transaction Date",
    "Description",
  ];

  const rows = transactions.map((transaction) => [
    transaction._id,
    transaction.orderId,
    `₹${transaction.amount?.toFixed(2) || "0.00"}`,
    transaction.paymentMethod || "Stripe",
    transaction.status,
    transaction.stripePaymentIntentId || "N/A",
    new Date(transaction.createdAt).toISOString().split("T")[0],
    transaction.description || "Rental Payment",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((field) => `"${field}"`).join(",")),
  ].join("\n");

  return csvContent;
};

/**
 * Set CSV download headers for response
 * @param {Object} res - Express response object
 * @param {string} filename - Name of the CSV file
 */
export const setCSVHeaders = (res, filename) => {
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}.csv"`
  );
  res.setHeader("Cache-Control", "no-cache");
};
