import axios from 'axios';

const API_BASE = 'http://localhost:5000';

async function testSignup() {
  try {
    console.log('Testing signup functionality...');
    
    const signupData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      password: 'password123',
      confirmPassword: 'password123',
      aadharNumber: '1234-5678-9012'
    };

    console.log('Sending signup data:', JSON.stringify(signupData, null, 2));

    const response = await axios.post(`${API_BASE}/api/auth/test-signup`, signupData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Signup successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Signup failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function testHealth() {
  try {
    console.log('Testing server health...');
    const response = await axios.get(`${API_BASE}/health`);
    console.log('✅ Server is healthy:', response.data);
  } catch (error) {
    console.error('❌ Server health check failed:', error.message);
  }
}

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    const response = await axios.get(`${API_BASE}/test-db`);
    console.log('✅ Database test:', response.data);
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
}

async function runTests() {
  console.log('=== RUNNING TESTS ===\n');
  
  await testHealth();
  console.log('');
  
  await testDatabase();
  console.log('');
  
  await testSignup();
  console.log('\n=== TESTS COMPLETED ===');
}

runTests();
