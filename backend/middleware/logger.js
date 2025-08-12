// Logging middleware for debugging API requests
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  console.log(`\n🚀 ${req.method} ${req.path}`);
  console.log(`📅 ${new Date().toISOString()}`);
  console.log(`👤 User: ${req.user?.email || "Not authenticated"}`);

  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📦 Request Body:`, JSON.stringify(req.body, null, 2));
  }

  if (req.query && Object.keys(req.query).length > 0) {
    console.log(`🔍 Query Params:`, JSON.stringify(req.query, null, 2));
  }

  // Log response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;
    console.log(`✅ Response (${duration}ms):`, JSON.stringify(data, null, 2));
    console.log(`📊 Status: ${res.statusCode}`);
    console.log("─".repeat(50));
    return originalSend.call(this, data);
  };

  next();
};

// Error logging middleware
export const errorLogger = (err, req, res, next) => {
  console.error(`\n❌ ERROR in ${req.method} ${req.path}`);
  console.error(`📅 ${new Date().toISOString()}`);
  console.error(`👤 User: ${req.user?.email || "Not authenticated"}`);
  console.error(`🔍 Error:`, err.message);
  console.error(`📚 Stack:`, err.stack);
  console.error("─".repeat(50));

  next(err);
};
