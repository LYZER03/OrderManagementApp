// test_auth.js
import authService from './authService';

// Test login function
const testLogin = async () => {
  console.log('Testing login with manager credentials...');
  try {
    const result = await authService.login('manager1', 'password123');
    console.log('Login successful!');
    console.log('User:', result.user);
    console.log('Access token:', result.access.substring(0, 20) + '...');
    return result;
  } catch (error) {
    console.error('Login failed:', error);
    return null;
  }
};

// Export the test function
export const runAuthTests = async () => {
  console.log('=== Running Auth Service Tests ===');
  const loginResult = await testLogin();
  console.log('=== Auth Tests Complete ===');
  return loginResult;
};
