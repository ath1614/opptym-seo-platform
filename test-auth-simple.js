// Simple test to check authentication
const testAuth = async () => {
  try {
    console.log('Testing authentication...')
    
    // Test login endpoint
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers)
    
    const data = await response.text()
    console.log('Response data:', data)
    
  } catch (error) {
    console.error('Auth test error:', error)
  }
}

// Run test
testAuth()
