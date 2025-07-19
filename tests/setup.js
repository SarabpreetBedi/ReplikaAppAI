// Jest setup file for test configuration

// Increase timeout for async operations
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  // Helper to create test user data
  createTestUser: (username = 'testuser') => ({
    username: username,
    email: `${username}@example.com`,
    password: 'testpassword123'
  }),

  // Helper to generate test messages
  createTestMessage: (content = 'Hello, this is a test message.') => content,

  // Helper to wait for socket events
  waitForSocketEvent: (socket, event, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout waiting for socket event: ${event}`));
      }, timeout);

      socket.once(event, (data) => {
        clearTimeout(timer);
        resolve(data);
      });
    });
  },

  // Helper to create conversation
  createTestConversation: async (axios, userId, title = 'Test Conversation') => {
    const response = await axios.post('http://localhost:5000/api/conversations', {
      userId: userId,
      title: title
    });
    return response.data.conversationId;
  },

  // Helper to send test message
  sendTestMessage: async (axios, userId, conversationId, message = 'Test message') => {
    return await axios.post('http://localhost:5000/api/chat', {
      message: message,
      userId: userId,
      conversationId: conversationId,
      personalityId: null
    });
  }
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Test environment variables
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-api-key';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.PORT = '5000'; 