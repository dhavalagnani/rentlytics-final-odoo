#!/usr/bin/env node

import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: join(__dirname, '..', '.env') });

const BASE_URL = process.env.SMOKE_TEST_URL || 'http://localhost:5000';
const TEST_EMAIL = process.env.SMOKE_TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.SMOKE_TEST_PASSWORD || 'password123';

// Configure axios with cookie handling
const http = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000
});

// Test results tracking
let testsPassed = 0;
let testsFailed = 0;

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const assert = (condition, message) => {
  if (condition) {
    testsPassed++;
    log(`PASS: ${message}`, 'success');
  } else {
    testsFailed++;
    log(`FAIL: ${message}`, 'error');
    throw new Error(message);
  }
};

const testHealthEndpoint = async () => {
  log('Testing health endpoint...');
  
  try {
    const response = await http.get('/api/health');
    
    assert(response.status === 200, 'Health endpoint should return 200');
    assert(response.data.ok === true, 'Health response should have ok: true');
    assert(response.data.env, 'Health response should include env');
    assert(response.data.timestamp, 'Health response should include timestamp');
    
    log(`Health check passed - Server running on port ${response.data.port}`);
    return true;
  } catch (error) {
    log(`Health check failed: ${error.message}`, 'error');
    return false;
  }
};

const testUnauthenticatedMe = async () => {
  log('Testing /api/auth/me without authentication...');
  
  try {
    await http.get('/api/auth/me');
    // Should not reach here - should get 401
    assert(false, 'Unauthenticated /me should return 401');
  } catch (error) {
    assert(error.response?.status === 401, 'Unauthenticated /me should return 401');
    log('Unauthenticated /me correctly returned 401');
    return true;
  }
};

const testLoginFlow = async () => {
  log('Testing login flow...');
  
  try {
    const loginResponse = await http.post('/api/auth/login', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    assert(loginResponse.status === 200, 'Login should return 200');
    assert(loginResponse.data.ok === true, 'Login response should have ok: true');
    assert(loginResponse.data.message, 'Login response should have message');
    
    // Check if Set-Cookie header is present
    const setCookieHeader = loginResponse.headers['set-cookie'];
    assert(setCookieHeader && setCookieHeader.length > 0, 'Login should set cookie');
    
    log('Login successful, cookie set');
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      log('Login failed with 401 - test user may not exist, creating test user...');
      return await createTestUser();
    }
    log(`Login failed: ${error.message}`, 'error');
    return false;
  }
};

const createTestUser = async () => {
  log('Creating test user for smoke test...');
  
  try {
    const signupResponse = await http.post('/api/auth/signup', {
      firstName: 'Smoke',
      lastName: 'Test',
      email: TEST_EMAIL,
      phone: '1234567890',
      password: TEST_PASSWORD,
      aadharNumber: '123456789012'
    });
    
    assert(signupResponse.status === 201, 'Signup should return 201');
    assert(signupResponse.data.ok === true, 'Signup response should have ok: true');
    
    log('Test user created successfully');
    return true;
  } catch (error) {
    log(`Test user creation failed: ${error.message}`, 'error');
    return false;
  }
};

const testAuthenticatedMe = async () => {
  log('Testing /api/auth/me with authentication...');
  
  try {
    const meResponse = await http.get('/api/auth/me');
    
    assert(meResponse.status === 200, 'Authenticated /me should return 200');
    assert(meResponse.data.ok === true, '/me response should have ok: true');
    assert(meResponse.data.user, '/me response should include user data');
    assert(meResponse.data.user.email === TEST_EMAIL, 'User email should match');
    
    log('Authenticated /me successful');
    return true;
  } catch (error) {
    log(`Authenticated /me failed: ${error.message}`, 'error');
    return false;
  }
};

const testProtectedEndpoint = async () => {
  log('Testing protected endpoint (/api/user/dashboard)...');
  
  try {
    const dashboardResponse = await http.get('/api/user/dashboard');
    
    assert(dashboardResponse.status === 200, 'Protected endpoint should return 200');
    assert(dashboardResponse.data.ok === true, 'Dashboard response should have ok: true');
    assert(dashboardResponse.data.data, 'Dashboard response should include data');
    
    log('Protected endpoint access successful');
    return true;
  } catch (error) {
    log(`Protected endpoint failed: ${error.message}`, 'error');
    return false;
  }
};

const testLogout = async () => {
  log('Testing logout...');
  
  try {
    const logoutResponse = await http.post('/api/auth/logout');
    
    assert(logoutResponse.status === 200, 'Logout should return 200');
    assert(logoutResponse.data.ok === true, 'Logout response should have ok: true');
    
    // Verify cookie is cleared
    const setCookieHeader = logoutResponse.headers['set-cookie'];
    if (setCookieHeader) {
      const cookieCleared = setCookieHeader.some(cookie => 
        cookie.includes('token=') && cookie.includes('Max-Age=0')
      );
      assert(cookieCleared, 'Logout should clear token cookie');
    }
    
    log('Logout successful');
    return true;
  } catch (error) {
    log(`Logout failed: ${error.message}`, 'error');
    return false;
  }
};

const runSmokeTests = async () => {
  log('🚀 Starting API Smoke Tests');
  log(`Base URL: ${BASE_URL}`);
  log(`Test Email: ${TEST_EMAIL}`);
  log('---');
  
  const tests = [
    { name: 'Health Check', fn: testHealthEndpoint },
    { name: 'Unauthenticated /me', fn: testUnauthenticatedMe },
    { name: 'Login Flow', fn: testLoginFlow },
    { name: 'Authenticated /me', fn: testAuthenticatedMe },
    { name: 'Protected Endpoint', fn: testProtectedEndpoint },
    { name: 'Logout', fn: testLogout }
  ];
  
  for (const test of tests) {
    try {
      log(`\n🧪 Running: ${test.name}`);
      await test.fn();
    } catch (error) {
      log(`Test ${test.name} failed: ${error.message}`, 'error');
    }
  }
  
  log('\n📊 Test Summary');
  log(`✅ Passed: ${testsPassed}`);
  log(`❌ Failed: ${testsFailed}`);
  log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
  
  if (testsFailed > 0) {
    log('Smoke tests failed!', 'error');
    process.exit(1);
  } else {
    log('All smoke tests passed! 🎉', 'success');
    process.exit(0);
  }
};

// Run tests
runSmokeTests().catch(error => {
  log(`Smoke test runner failed: ${error.message}`, 'error');
  process.exit(1);
});
