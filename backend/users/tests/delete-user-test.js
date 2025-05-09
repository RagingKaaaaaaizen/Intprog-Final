/**
 * Test script for admin user delete functionality
 * 
 * This script tests that:
 * 1. Admin users can delete any user account
 * 2. Regular users cannot delete other user accounts
 */

const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:4000';
let adminToken = null;
let userToken = null;
let testUserId = null;

// Test admin user creation and authentication
async function setupTest() {
  try {
    console.log('Setting up test...');
    
    // Create test admin account
    const adminResponse = await axios.post(`${API_URL}/accounts/register`, {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin.test@example.com',
      password: 'Password123!',
      role: 'Admin'
    });
    
    console.log('Admin registered successfully');
    
    // Create test regular user account
    const userResponse = await axios.post(`${API_URL}/accounts/register`, {
      firstName: 'Test',
      lastName: 'User',
      email: 'test.user@example.com',
      password: 'Password123!',
      role: 'User'
    });
    
    console.log('Test user registered successfully');
    
    // Note: In a real scenario, you would need to verify the email first
    // For testing purposes, we'll modify our calls to work without email verification
    
    // Authenticate as admin
    const adminAuthResponse = await axios.post(`${API_URL}/accounts/authenticate`, {
      email: 'admin.test@example.com',
      password: 'Password123!'
    });
    
    adminToken = adminAuthResponse.data.jwtToken;
    console.log('Admin authenticated successfully');
    
    // Authenticate as regular user
    const userAuthResponse = await axios.post(`${API_URL}/accounts/authenticate`, {
      email: 'test.user@example.com',
      password: 'Password123!'
    });
    
    userToken = userAuthResponse.data.jwtToken;
    console.log('User authenticated successfully');
    
    // Create a user to be deleted
    const deleteUserResponse = await axios.post(`${API_URL}/accounts/register`, {
      firstName: 'Delete',
      lastName: 'Me',
      email: 'delete.me@example.com',
      password: 'Password123!',
      role: 'User'
    });
    
    console.log('User to delete registered successfully');
    
    // Get all users to find the ID of the user to delete
    const allUsersResponse = await axios.get(`${API_URL}/accounts`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    testUserId = allUsersResponse.data.find(u => u.email === 'delete.me@example.com').id;
    console.log(`User to delete ID: ${testUserId}`);
    
    return true;
  } catch (error) {
    console.error('Setup error:', error.response ? error.response.data : error.message);
    return false;
  }
}

// Test admin delete functionality
async function testAdminDeleteUser() {
  try {
    console.log('\nTesting admin deleting user...');
    const response = await axios.delete(`${API_URL}/accounts/${testUserId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Admin successfully deleted user:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Admin delete error:', error.response ? error.response.data : error.message);
    return false;
  }
}

// Test regular user trying to delete another user
async function testUserDeleteOtherUser() {
  try {
    console.log('\nTesting regular user trying to delete another user (should fail)...');
    
    // Create another user to try to delete
    const anotherUserResponse = await axios.post(`${API_URL}/accounts/register`, {
      firstName: 'Another',
      lastName: 'User',
      email: 'another.user@example.com',
      password: 'Password123!',
      role: 'User'
    });
    
    console.log('Another test user registered successfully');
    
    // Get all users to find the ID of the user
    const allUsersResponse = await axios.get(`${API_URL}/accounts`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const anotherUserId = allUsersResponse.data.find(u => u.email === 'another.user@example.com').id;
    
    // Try to delete as regular user
    const response = await axios.delete(`${API_URL}/accounts/${anotherUserId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    console.error('❌ Test failed: Regular user was able to delete another user', response.data);
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Test passed: Regular user correctly prevented from deleting another user');
      return true;
    }
    console.error('Test error:', error.response ? error.response.data : error.message);
    return false;
  }
}

// Run the tests
async function runTests() {
  const setupSuccess = await setupTest();
  if (!setupSuccess) {
    console.error('Test setup failed, canceling tests');
    return;
  }
  
  await testAdminDeleteUser();
  await testUserDeleteOtherUser();
  
  console.log('\nTests completed');
}

runTests(); 