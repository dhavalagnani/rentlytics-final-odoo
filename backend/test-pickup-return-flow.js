const axios = require("axios");

const API_BASE = "http://localhost:5000/api";
let authToken = null;
let testUserId = null;
let testProductId = null;
let testBookingId = null;

// Test configuration
const testConfig = {
  user: {
    firstName: "Test",
    lastName: "Customer",
    email: "testcustomer@example.com",
    password: "TestPassword123!",
    phone: "+919876543210",
  },
  product: {
    name: "Test Camera Equipment",
    description: "Professional camera equipment for rent",
    category: "Electronics",
    price: 500,
    deposit: 1000,
    availableQuantity: 5,
  },
  pickupAddress: {
    street: "123 Pickup Street",
    city: "Mumbai",
    state: "Maharashtra",
    zipCode: "400001",
    country: "India",
    coordinates: {
      latitude: 19.076,
      longitude: 72.8777,
    },
  },
  dropAddress: {
    street: "456 Return Avenue",
    city: "Mumbai",
    state: "Maharashtra",
    zipCode: "400002",
    country: "India",
    coordinates: {
      latitude: 19.076,
      longitude: 72.8777,
    },
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
    testProductId = result.data.productId;
    log("✅ Product creation successful", "success");
    return true;
  } else {
    log(`❌ Product creation failed: ${result.error}`, "error");
    return false;
  }
};

const testBookingCreation = async () => {
  log("Testing booking creation...", "info");
  const bookingData = {
    bookingId: `BK${Date.now()}`,
    userId: testUserId,
    productId: testProductId,
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    unitCount: 1,
    pickupAddress: testConfig.pickupAddress,
    dropAddress: testConfig.dropAddress,
  };

  const result = await makeRequest("POST", "/bookings/create", bookingData);

  if (result.success) {
    testBookingId = result.data.bookingId;
    log("✅ Booking creation successful", "success");
    return true;
  } else {
    log(`❌ Booking creation failed: ${result.error}`, "error");
    return false;
  }
};

const testPickupConfirmation = async () => {
  log("Testing pickup confirmation...", "info");
  const pickupData = {
    pickupAddress: testConfig.pickupAddress,
    pickedUpBy: "Test Pickup Team",
    notes: "Customer provided valid ID, items inspected and handed over",
  };

  const result = await makeRequest(
    "POST",
    `/bookings/${testBookingId}/pickup/confirm`,
    pickupData
  );

  if (result.success) {
    log("✅ Pickup confirmation successful", "success");
    log(`   Document ID: ${result.data.pickupDocument.documentId}`, "info");
    log(`   Status: ${result.data.booking.status}`, "info");
    return true;
  } else {
    log(`❌ Pickup confirmation failed: ${result.error}`, "error");
    return false;
  }
};

const testReturnConfirmation = async () => {
  log("Testing return confirmation...", "info");
  const returnData = {
    dropAddress: testConfig.dropAddress,
    returnedBy: "Test Return Team",
    condition: "good",
    notes: "Items returned in good condition, minor wear and tear",
    actualReturnDate: new Date().toISOString(),
  };

  const result = await makeRequest(
    "POST",
    `/bookings/${testBookingId}/return/confirm`,
    returnData
  );

  if (result.success) {
    log("✅ Return confirmation successful", "success");
    log(`   Document ID: ${result.data.returnDocument.documentId}`, "info");
    log(`   Status: ${result.data.booking.status}`, "info");
    log(
      `   Total Penalty: ₹${result.data.booking.penalties.totalPenalty}`,
      "info"
    );
    return true;
  } else {
    log(`❌ Return confirmation failed: ${result.error}`, "error");
    return false;
  }
};

const testMyBookings = async () => {
  log("Testing My Bookings API...", "info");
  const result = await makeRequest("GET", "/bookings/my");

  if (result.success) {
    log("✅ My Bookings API successful", "success");
    log(`   Total bookings: ${result.data.total}`, "info");
    log(`   Reserved: ${result.data.stats.reserved}`, "info");
    log(`   Picked up: ${result.data.stats.picked_up}`, "info");
    log(`   Returned: ${result.data.stats.returned}`, "info");
    return true;
  } else {
    log(`❌ My Bookings API failed: ${result.error}`, "error");
    return false;
  }
};

const testPenaltySettings = async () => {
  log("Testing penalty settings...", "info");

  // Get current settings
  const getResult = await makeRequest("GET", "/settings/penalty");
  if (!getResult.success) {
    log(`❌ Get penalty settings failed: ${getResult.error}`, "error");
    return false;
  }

  log("✅ Get penalty settings successful", "success");

  // Update settings
  const updateData = {
    damagePenaltyRate: 15,
    latePenaltyRate: 8,
    maxLatePenaltyDays: 10,
  };

  const updateResult = await makeRequest(
    "PUT",
    "/settings/penalty",
    updateData
  );
  if (updateResult.success) {
    log("✅ Update penalty settings successful", "success");
    return true;
  } else {
    log(`❌ Update penalty settings failed: ${updateResult.error}`, "error");
    return false;
  }
};

const testStockService = async () => {
  log("Testing stock service...", "info");

  // Get stock info
  const result = await makeRequest("GET", `/products/${testProductId}`);

  if (result.success) {
    log("✅ Stock service test successful", "success");
    log(`   Product: ${result.data.name}`, "info");
    log(`   Available: ${result.data.availableQuantity}`, "info");
    log(`   Status: ${result.data.status}`, "info");
    return true;
  } else {
    log(`❌ Stock service test failed: ${result.error}`, "error");
    return false;
  }
};

const testDocumentService = async () => {
  log("Testing document service...", "info");

  // Get booking with documents
  const result = await makeRequest(
    "GET",
    `/bookings/getbyid?bookingId=${testBookingId}`
  );

  if (result.success) {
    const booking = result.data;
    log("✅ Document service test successful", "success");

    if (booking.pickupDocument) {
      log(`   Pickup Document: ${booking.pickupDocument.documentId}`, "info");
    }

    if (booking.returnDocument) {
      log(`   Return Document: ${booking.returnDocument.documentId}`, "info");
    }

    return true;
  } else {
    log(`❌ Document service test failed: ${result.error}`, "error");
    return false;
  }
};

// Main test runner
const runPickupReturnFlowTests = async () => {
  log("🚀 Starting Pickup & Return Flow Integration Tests", "info");
  log("==================================================", "info");

  const results = {
    healthCheck: false,
    userRegistration: false,
    userLogin: false,
    productCreation: false,
    bookingCreation: false,
    pickupConfirmation: false,
    returnConfirmation: false,
    myBookings: false,
    penaltySettings: false,
    stockService: false,
    documentService: false,
  };

  try {
    // Basic connectivity tests
    results.healthCheck = await testHealthCheck();
    if (!results.healthCheck) {
      log("❌ Health check failed - stopping tests", "error");
      return results;
    }

    // Authentication tests
    results.userRegistration = await testUserRegistration();
    results.userLogin = await testUserLogin();
    if (!results.userLogin) {
      log("❌ User login failed - stopping tests", "error");
      return results;
    }

    // Product and booking setup
    results.productCreation = await testProductCreation();
    if (!results.productCreation) {
      log("❌ Product creation failed - stopping tests", "error");
      return results;
    }

    results.bookingCreation = await testBookingCreation();
    if (!results.bookingCreation) {
      log("❌ Booking creation failed - stopping tests", "error");
      return results;
    }

    // Pickup & Return Flow tests
    results.pickupConfirmation = await testPickupConfirmation();
    results.returnConfirmation = await testReturnConfirmation();

    // Additional service tests
    results.myBookings = await testMyBookings();
    results.penaltySettings = await testPenaltySettings();
    results.stockService = await testStockService();
    results.documentService = await testDocumentService();
  } catch (error) {
    log(`❌ Test execution error: ${error.message}`, "error");
  }

  // Summary
  log("==================================================", "info");
  log("📊 Pickup & Return Flow Test Results", "info");
  log("==================================================", "info");

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, result]) => {
    const status = result ? "✅ PASS" : "❌ FAIL";
    log(`${status} ${test}`, result ? "success" : "error");
  });

  log("==================================================", "info");
  log(
    `Overall: ${passed}/${total} tests passed`,
    passed === total ? "success" : "warning"
  );

  if (passed === total) {
    log("🎉 All pickup & return flow tests passed!", "success");
    log("✅ Pickup & Return flow is fully integrated and working!", "success");
  } else {
    log("⚠️ Some tests failed - check the logs above", "warning");
  }

  return results;
};

// Run tests if this file is executed directly
if (require.main === module) {
  runPickupReturnFlowTests()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      log(`❌ Test runner error: ${error.message}`, "error");
      process.exit(1);
    });
}

module.exports = { runPickupReturnFlowTests };
