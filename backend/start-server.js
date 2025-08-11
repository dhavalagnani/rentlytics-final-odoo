// Set required environment variables
process.env.JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-here-change-this-in-production";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
process.env.NODE_ENV = process.env.NODE_ENV || "development";
process.env.PORT = process.env.PORT || "5000";

console.log("=== ENVIRONMENT VARIABLES ===");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "NOT SET");
console.log("JWT_EXPIRES_IN:", process.env.JWT_EXPIRES_IN);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("================================");

// Import and start the server
import("./server.js").catch(error => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
