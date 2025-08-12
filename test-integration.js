const axios = require("axios");

const API_BASE = "http://localhost:5000/api";
let authToken = null;
let testUserId = null;

// Test configuration
const testConfig = {
  user: {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    password: "TestPassword123!",
    phone: "+1234567890",
  },
  product: {
    name: "Test Product",
    description: "Test product description",
    category: "Electronics",
    price: 100,
    deposit: 50,
  },
  booking: {
    customerName: "Test Customer",
    customerEmail: "customer@example.com",
    customerPhone: "+1234567890",
    productName: "Test Product",
    pickupDate: "2024-01-15",
    pickupTime: "10:00",
    returnDate: "2024-01-17",
    returnTime: "18:00",
    pickupLocation: "Test Pickup Location",
    returnLocation: "Test Return Location",
    notes: "Test booking notes",
  },
};

// Utility functions
const log = (message, type = "info") => {
  const timestamp = new Date().toISOString();
  const colors = {
    info: "\x1b[36m", // Cyan
    success: "\x1b[32m", // Green
    error: "\x1b[31m", // Red
    warning: "\x1b[33m", // Yellow
  };
  console.log(`${colors[type]}[${timestamp}] ${message}\x1b[0m`);
};

const makeRequest = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (data) {
      config.data = data;
    }

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status,
    };
  }
};

// Test functions
const testHealthCheck = async () => {
  log("Testing health check...", "info");
  const result = await makeRequest("GET", "/health");

  if (result.success) {
    log("✅ Health check passed", "success");
    return true;
  } else {
    log(`❌ Health check failed: ${result.error}`, "error");
    return false;
  }
};

const testDatabaseConnection = async () => {
  log("Testing database connection...", "info");
  const result = await makeRequest("GET", "/test-db");

  if (result.success && result.data.dbState === "connected") {
    log("✅ Database connection successful", "success");
    return true;
  } else {
    log(`❌ Database connection failed: ${result.error}`, "error");
    return false;
  }
};

const testUserRegistration = async () => {
  log("Testing user registration...", "info");
  const result = await makeRequest("POST", "/auth/signup", testConfig.user);

  if (result.success) {
    log("✅ User registration successful", "success");
    return true;
  } else {
    log(`❌ User registration failed: ${result.error}`, "error");
    return false;
  }
};

const testUserLogin = async () => {
  log("Testing user login...", "info");
  const result = await makeRequest("POST", "/auth/login", {
    email: testConfig.user.email,
    password: testConfig.user.password,
  });

  if (result.success && result.data.token) {
    authToken = result.data.token;
    testUserId = result.data.user._id;
    log("✅ User login successful", "success");
    return true;
  } else {
    log(`❌ User login failed: ${result.error}`, "error");
    return false;
  }
};

const testProductCreation = async () => {
  log("Testing product creation...", "info");
  const result = await makeRequest("POST", "/products", testConfig.product);

  if (result.success) {
    log("✅ Product creation successful", "success");
    return result.data.productId;
  } else {
    log(`❌ Product creation failed: ${result.error}`, "error");
    return null;
  }
};

const testProductRetrieval = async () => {
  log("Testing product retrieval...", "info");
  const result = await makeRequest("GET", "/products");

  if (result.success && result.data.products) {
    log(
      `✅ Product retrieval successful - Found ${result.data.products.length} products`,
      "success"
    );
    return result.data.products[0]?._id;
  } else {
    log(`❌ Product retrieval failed: ${result.error}`, "error");
    return null;
  }
};

const testBookingCreation = async (productId) => {
  log("Testing booking creation...", "info");
  const bookingData = {
    ...testConfig.booking,
    productId: productId,
  };

  const result = await makeRequest("POST", "/bookings/create", bookingData);

  if (result.success) {
    log("✅ Booking creation successful", "success");
    return result.data.bookingId;
  } else {
    log(`❌ Booking creation failed: ${result.error}`, "error");
    return null;
  }
};

const testBookingRetrieval = async () => {
  log("Testing booking retrieval...", "info");
  const result = await makeRequest("GET", "/bookings");

  if (result.success && result.data.bookings) {
    log(
      `✅ Booking retrieval successful - Found ${result.data.bookings.length} bookings`,
      "success"
    );
    return result.data.bookings[0]?._id;
  } else {
    log(`❌ Booking retrieval failed: ${result.error}`, "error");
    return null;
  }
};

const testTransactionCreation = async (bookingId) => {
  log("Testing transaction creation...", "info");
  const transactionData = {
    orderId: bookingId,
    amount: 100,
    method: "card",
    type: "payment",
    status: "completed",
    transactionRef: `TXN${Date.now()}`,
    paymentDetails: {
      cardLast4: "1234",
      reference: `REF${Date.now()}`,
    },
  };

  const result = await makeRequest(
    "POST",
    "/transactions/create",
    transactionData
  );

  if (result.success) {
    log("✅ Transaction creation successful", "success");
    return result.data.transactionId;
  } else {
    log(`❌ Transaction creation failed: ${result.error}`, "error");
    return null;
  }
};

const testTransactionRetrieval = async () => {
  log("Testing transaction retrieval...", "info");
  const result = await makeRequest("GET", "/transactions");

  if (result.success && result.data.transactions) {
    log(
      `✅ Transaction retrieval successful - Found ${result.data.transactions.length} transactions`,
      "success"
    );
    return true;
  } else {
    log(`❌ Transaction retrieval failed: ${result.error}`, "error");
    return false;
  }
};

const testTransactionStats = async () => {
  log("Testing transaction statistics...", "info");
  const result = await makeRequest("GET", "/transactions/stats");

  if (result.success) {
    log("✅ Transaction statistics retrieved successfully", "success");
    log(`   Total Revenue: ${result.data.totalRevenue}`, "info");
    log(`   Total Transactions: ${result.data.totalTransactions}`, "info");
    return true;
  } else {
    log(`❌ Transaction statistics failed: ${result.error}`, "error");
    return false;
  }
};

const testBookingStats = async () => {
  log("Testing booking statistics...", "info");
  const result = await makeRequest("GET", "/bookings/stats");

  if (result.success) {
    log("✅ Booking statistics retrieved successfully", "success");
    log(`   Total Bookings: ${result.data.totalBookings}`, "info");
    log(`   Completion Rate: ${result.data.completionRate}%`, "info");
    return true;
  } else {
    log(`❌ Booking statistics failed: ${result.error}`, "error");
    return false;
  }
};

const testRevenueAnalytics = async () => {
  log("Testing revenue analytics...", "info");
  const result = await makeRequest("GET", "/transactions/revenue?period=month");

  if (result.success) {
    log("✅ Revenue analytics retrieved successfully", "success");
    log(`   Data points: ${result.data.length}`, "info");
    return true;
  } else {
    log(`❌ Revenue analytics failed: ${result.error}`, "error");
    return false;
  }
};

const testPickupConfirmation = async (bookingId) => {
  if (!bookingId) {
    log("⚠️ Skipping pickup confirmation - no booking ID", "warning");
    return false;
  }

  log("Testing pickup confirmation...", "info");
  const pickupData = {
    pickupDate: "2024-01-15",
    pickupTime: "10:00",
    pickupLocation: "Test Pickup Location",
    notes: "Test pickup notes",
  };

  const result = await makeRequest(
    "POST",
    `/bookings/${bookingId}/pickup/confirm`,
    pickupData
  );

  if (result.success) {
    log("✅ Pickup confirmation successful", "success");
    return true;
  } else {
    log(`❌ Pickup confirmation failed: ${result.error}`, "error");
    return false;
  }
};

const testReturnConfirmation = async (bookingId) => {
  if (!bookingId) {
    log("⚠️ Skipping return confirmation - no booking ID", "warning");
    return false;
  }

  log("Testing return confirmation...", "info");
  const returnData = {
    returnDate: "2024-01-17",
    returnTime: "18:00",
    returnLocation: "Test Return Location",
    condition: "good",
    notes: "Test return notes",
  };

  const result = await makeRequest(
    "POST",
    `/bookings/${bookingId}/return/confirm`,
    returnData
  );

  if (result.success) {
    log("✅ Return confirmation successful", "success");
    return true;
  } else {
    log(`❌ Return confirmation failed: ${result.error}`, "error");
    return false;
  }
};

// Main test runner
const runIntegrationTests = async () => {
  log("🚀 Starting Integration Tests", "info");
  log("================================", "info");

  const results = {
    healthCheck: false,
    databaseConnection: false,
    userRegistration: false,
    userLogin: false,
    productCreation: false,
    productRetrieval: false,
    bookingCreation: false,
    bookingRetrieval: false,
    transactionCreation: false,
    transactionRetrieval: false,
    transactionStats: false,
    bookingStats: false,
    revenueAnalytics: false,
    pickupConfirmation: false,
    returnConfirmation: false,
  };

  let productId = null;
  let bookingId = null;

  try {
    // Basic connectivity tests
    results.healthCheck = await testHealthCheck();
    if (!results.healthCheck) {
      log("❌ Health check failed - stopping tests", "error");
      return results;
    }

    results.databaseConnection = await testDatabaseConnection();
    if (!results.databaseConnection) {
      log("❌ Database connection failed - stopping tests", "error");
      return results;
    }

    // Authentication tests
    results.userRegistration = await testUserRegistration();
    results.userLogin = await testUserLogin();
    if (!results.userLogin) {
      log("❌ User login failed - stopping tests", "error");
      return results;
    }

    // Product tests
    results.productCreation = await testProductCreation();
    if (results.productCreation) {
      productId = results.productCreation;
    }
    results.productRetrieval = await testProductRetrieval();

    // Booking tests
    results.bookingCreation = await testBookingCreation(productId);
    if (results.bookingCreation) {
      bookingId = results.bookingCreation;
    }
    results.bookingRetrieval = await testBookingRetrieval();

    // Transaction tests
    results.transactionCreation = await testTransactionCreation(bookingId);
    results.transactionRetrieval = await testTransactionRetrieval();

    // Analytics tests
    results.transactionStats = await testTransactionStats();
    results.bookingStats = await testBookingStats();
    results.revenueAnalytics = await testRevenueAnalytics();

    // Workflow tests
    results.pickupConfirmation = await testPickupConfirmation(bookingId);
    results.returnConfirmation = await testReturnConfirmation(bookingId);
  } catch (error) {
    log(`❌ Test execution error: ${error.message}`, "error");
  }

  // Summary
  log("================================", "info");
  log("📊 Integration Test Results", "info");
  log("================================", "info");

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, result]) => {
    const status = result ? "✅ PASS" : "❌ FAIL";
    log(`${status} ${test}`, result ? "success" : "error");
  });

  log("================================", "info");
  log(
    `Overall: ${passed}/${total} tests passed`,
    passed === total ? "success" : "warning"
  );

  if (passed === total) {
    log("🎉 All integration tests passed!", "success");
  } else {
    log("⚠️ Some tests failed - check the logs above", "warning");
  }

  return results;
};

// Run tests if this file is executed directly
if (require.main === module) {
  runIntegrationTests()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      log(`❌ Test runner error: ${error.message}`, "error");
      process.exit(1);
    });
}

module.exports = { runIntegrationTests };
