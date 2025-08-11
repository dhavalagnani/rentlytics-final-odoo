import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import categoryRoutes from "./routes/categories.route.js";
import productRoutes from "./routes/products.route.js";
import bookingRoutes from "./routes/bookings.route.js";
import orderRoutes from "./routes/orders.route.js";
import transactionRoutes from "./routes/transactions.route.js";
import pricelistRoutes from "./routes/pricelists.route.js";
import priceRuleRoutes from "./routes/pricerules.route.js";
import paymentRoutes from "./routes/payment.route.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
// Update FRONTEND_URL in .env if using remote frontend
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://yourdomain.com"]
      : [
          "http://localhost:5173",
          "http://localhost:3000",
          "http://localhost:5174",
          "http://localhost:5172",
          "http://127.0.0.1:5173",
          ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
        ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

// Lightweight health check endpoint (no DB dependency)
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    port: PORT,
    uptime: process.uptime(),
  });
});

// Legacy health check route (for backward compatibility)
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Test database connection
app.get("/api/test-db", (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    res.json({
      ok: true,
      message: "Database connection test",
      dbState: states[dbState],
      dbStateCode: dbState,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Legacy test-db route (for backward compatibility)
app.get("/test-db", (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    res.json({
      ok: true,
      message: "Database connection test",
      dbState: states[dbState],
      dbStateCode: dbState,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/pricelists", pricelistRoutes);
app.use("/api/pricerules", priceRuleRoutes);
app.use("/api/payment", paymentRoutes);

// Centralized error handling middleware
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    ok: false,
    message: "Route not found",
  });
});

// Connect to MongoDB with retry logic
const connectDB = async (retries = 3, interval = 2000) => {
  if (!process.env.MONGO_URI) {
    console.error(
      "❌ MongoDB connection string (MONGO_URI) is missing in environment variables."
    );
    console.error("Please check your .env file and ensure MONGO_URI is set.");
    process.exit(1);
  }

  // Redact password from URI for logging
  const logUri = process.env.MONGO_URI.replace(/:([^@]+)@/, ":****@");
  console.log(`🔗 Connecting to MongoDB: ${logUri}`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(
        `🔄 Attempting to connect to MongoDB (attempt ${attempt}/${retries})...`
      );

      const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(
        `❌ MongoDB connection attempt ${attempt} failed:`,
        error.message
      );
      console.error("Stack trace:", error.stack);

      if (attempt === retries) {
        console.error("❌ All MongoDB connection attempts failed. Exiting.");
        console.error(
          "MongoDB connection failed. Check MONGO_URI in .env. Exiting."
        );
        console.error("Please check:");
        console.error("1. MongoDB server is running");
        console.error("2. MONGO_URI is correct in your .env file");
        console.error("3. Network connectivity to MongoDB");
        process.exit(1);
      }

      console.log(`⏳ Retrying in ${interval / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }
};

// Start server
const startServer = async () => {
  try {
    // Start server first, then connect to DB
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });

    // Connect to database
    await connectDB();

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully");
      server.close(() => {
        console.log("Process terminated");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("SIGINT received, shutting down gracefully");
      server.close(() => {
        console.log("Process terminated");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
