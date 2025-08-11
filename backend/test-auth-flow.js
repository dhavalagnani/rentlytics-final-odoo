import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Create axios instance with cookie handling
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Test authentication flow
async function testAuthFlow() {
  try {
    console.log('=== TESTING AUTHENTICATION FLOW ===');
    
    // Step 1: Try to get current user (should fail)
    console.log('\n1. Testing getCurrentUser before login...');
    try {
      const currentUser = await api.get('/auth/me');
      console.log('❌ Unexpected success:', currentUser.data);
    } catch (error) {
      console.log('✅ Expected failure:', error.response?.data?.message || error.message);
    }
    
    // Step 2: Login
    console.log('\n2. Testing login...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const loginResponse = await api.post('/auth/login', loginData);
    console.log('✅ Login response:', loginResponse.data);
    
    // Step 3: Check if cookie was set
    console.log('\n3. Checking cookies after login...');
    console.log('Cookies in axios instance:', api.defaults.headers.Cookie);
    
    // Step 4: Try to get current user again (should succeed)
    console.log('\n4. Testing getCurrentUser after login...');
    const currentUserResponse = await api.get('/auth/me');
    console.log('✅ Current user response:', currentUserResponse.data);
    
    // Step 5: Logout
    console.log('\n5. Testing logout...');
    const logoutResponse = await api.post('/auth/logout');
    console.log('✅ Logout response:', logoutResponse.data);
    
    // Step 6: Try to get current user after logout (should fail)
    console.log('\n6. Testing getCurrentUser after logout...');
    try {
      const currentUserAfterLogout = await api.get('/auth/me');
      console.log('❌ Unexpected success after logout:', currentUserAfterLogout.data);
    } catch (error) {
      console.log('✅ Expected failure after logout:', error.response?.data?.message || error.message);
    }
    
    console.log('\n=== AUTHENTICATION FLOW TEST COMPLETED ===');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAuthFlow();
