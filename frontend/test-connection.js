// Test frontend-backend connection
const axios = require('axios');

async function testConnection() {
  try {
    console.log('Testing connection to backend...');
    
    // Test basic connection
    const response = await axios.get('http://localhost:8001/');
    console.log('✓ Backend connection successful');
    console.log('Response:', response.data);
    
    // Test login with correct credentials
    const loginResponse = await axios.post('http://localhost:8001/login', {
      username: 'superadmin',
      password: 'password123'
    });
    console.log('✓ Login successful');
    console.log('Token received:', loginResponse.data.access_token ? 'Yes' : 'No');
    
    // Test login with incorrect credentials
    try {
      await axios.post('http://localhost:8001/login', {
        username: 'wronguser',
        password: 'wrongpass'
      });
      console.log('✗ Should have failed with wrong credentials');
    } catch (error) {
      console.log('✓ Correctly rejected wrong credentials');
    }
    
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
  }
}

testConnection();
