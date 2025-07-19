const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from React build directory if it exists
const buildPath = path.join(__dirname, 'client/build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
}

// Database setup
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./replika.db');

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Conversations table
  db.run(`CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Messages table
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT,
    content TEXT,
    sender TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations (id)
  )`);

  // Knowledge base table
  db.run(`CREATE TABLE IF NOT EXISTS knowledge_base (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT,
    content TEXT,
    file_type TEXT,
    file_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Personality settings table
  db.run(`CREATE TABLE IF NOT EXISTS personality_settings (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT,
    description TEXT,
    traits TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
});

// OpenAI configuration
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here'
});

// File upload handling
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// API Routes

// User registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    db.run(
      'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
      [userId, username, email, passwordHash],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }
        res.json({ message: 'User registered successfully', userId });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) return res.status(500).json({ error: 'Login failed' });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
      res.json({ token, userId: user.id, username: user.username });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get conversations
app.get('/api/conversations/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.all(
    'SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, conversations) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch conversations' });
      res.json(conversations);
    }
  );
});

// Create new conversation
app.post('/api/conversations', (req, res) => {
  const { userId, title } = req.body;
  const conversationId = uuidv4();

  db.run(
    'INSERT INTO conversations (id, user_id, title) VALUES (?, ?, ?)',
    [conversationId, userId, title],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to create conversation' });
      res.json({ conversationId, title });
    }
  );
});

// Get messages for a conversation
app.get('/api/messages/:conversationId', (req, res) => {
  const { conversationId } = req.params;

  db.all(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC',
    [conversationId],
    (err, messages) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch messages' });
      res.json(messages);
    }
  );
});

// Save message
app.post('/api/messages', (req, res) => {
  const { conversationId, content, sender } = req.body;
  const messageId = uuidv4();

  db.run(
    'INSERT INTO messages (id, conversation_id, content, sender) VALUES (?, ?, ?, ?)',
    [messageId, conversationId, content, sender],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to save message' });
      res.json({ messageId, content, sender });
    }
  );
});

// Upload knowledge base file
app.post('/api/knowledge/upload', upload.single('file'), async (req, res) => {
  try {
    const { userId, title } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let content = '';
    const fileType = file.mimetype;

    // Parse different file types
    if (fileType === 'application/pdf') {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(file.path);
      const data = await pdfParse(dataBuffer);
      content = data.text;
    } else if (fileType.includes('word') || fileType.includes('docx')) {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: file.path });
      content = result.value;
    } else if (fileType.includes('text') || fileType.includes('txt')) {
      content = fs.readFileSync(file.path, 'utf8');
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const knowledgeId = uuidv4();
    
    db.run(
      'INSERT INTO knowledge_base (id, user_id, title, content, file_type, file_path) VALUES (?, ?, ?, ?, ?, ?)',
      [knowledgeId, userId, title, content, fileType, file.path],
      function(err) {
        if (err) return res.status(500).json({ error: 'Failed to save knowledge' });
        res.json({ knowledgeId, title, content: content.substring(0, 100) + '...' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to process file' });
  }
});

// Get knowledge base
app.get('/api/knowledge/:userId', (req, res) => {
  const { userId } = req.params;

  db.all(
    'SELECT id, title, content, file_type, created_at FROM knowledge_base WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, knowledge) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch knowledge' });
      res.json(knowledge);
    }
  );
});

// Chat with AI
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId, conversationId, personalityId } = req.body;

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.error('OpenAI API key not configured');
      return res.status(500).json({ 
        error: 'AI service not configured. Please add your OpenAI API key to the .env file.',
        details: 'Get your API key from https://platform.openai.com/api-keys'
      });
    }

    // Validate required fields
    if (!message || !userId || !conversationId) {
      return res.status(400).json({ error: 'Missing required fields: message, userId, conversationId' });
    }

    // Get user's knowledge base
    db.all(
      'SELECT content FROM knowledge_base WHERE user_id = ?',
      [userId],
      async (err, knowledgeBase) => {
        if (err) {
          console.error('Database error fetching knowledge:', err);
          return res.status(500).json({ error: 'Failed to fetch knowledge' });
        }

        // Get personality settings
        db.get(
          'SELECT * FROM personality_settings WHERE user_id = ? AND id = ?',
          [userId, personalityId],
          async (err, personality) => {
            if (err) {
              console.error('Database error fetching personality:', err);
              return res.status(500).json({ error: 'Failed to fetch personality' });
            }

            try {
              // Build context from knowledge base
              let context = '';
              if (knowledgeBase && knowledgeBase.length > 0) {
                context = 'Custom Knowledge:\n' + knowledgeBase.map(k => k.content).join('\n\n') + '\n\n';
              }

              // Build personality prompt
              let personalityPrompt = '';
              if (personality) {
                personalityPrompt = `Personality: ${personality.description}\nTraits: ${personality.traits}\n\n`;
              } else {
                personalityPrompt = `You are a friendly, empathetic AI companion. Be supportive, caring, and engaging in conversation. Always respond in a warm and personal manner.\n\n`;
              }

              const systemPrompt = personalityPrompt + context + 
                'Instructions: Respond as a caring AI companion. Use the custom knowledge when relevant to provide helpful and accurate information. Keep responses conversational and engaging.';

              console.log('Sending request to OpenAI...');
              const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: message }
                ],
                max_tokens: 500,
                temperature: 0.7,
                timeout: 30000 // 30 second timeout
              });

              const aiResponse = completion.choices[0].message.content;
              console.log('OpenAI response received:', aiResponse.substring(0, 50) + '...');

              // Save the conversation
              const messageId = uuidv4();
              const aiMessageId = uuidv4();

              db.serialize(() => {
                db.run(
                  'INSERT INTO messages (id, conversation_id, content, sender) VALUES (?, ?, ?, ?)',
                  [messageId, conversationId, message, 'user'],
                  function(err) {
                    if (err) console.error('Error saving user message:', err);
                  }
                );
                db.run(
                  'INSERT INTO messages (id, conversation_id, content, sender) VALUES (?, ?, ?, ?)',
                  [aiMessageId, conversationId, aiResponse, 'ai'],
                  function(err) {
                    if (err) console.error('Error saving AI message:', err);
                  }
                );
              });

              res.json({ 
                response: aiResponse,
                messageId,
                aiMessageId
              });
            } catch (openaiError) {
              console.error('OpenAI API error:', openaiError);
              res.status(500).json({ 
                error: 'Failed to generate AI response',
                details: openaiError.message
              });
            }
          }
        );
      }
    );
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message
    });
  }
});

// Socket.IO for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('send-message', async (data) => {
    const { message, conversationId, userId, personalityId } = data;
    
    try {
      // Get user's knowledge base
      db.all(
        'SELECT content FROM knowledge_base WHERE user_id = ?',
        [userId],
        async (err, knowledgeBase) => {
          if (err) {
            socket.emit('error', { error: 'Failed to fetch knowledge' });
            return;
          }

          // Get personality settings
          db.get(
            'SELECT * FROM personality_settings WHERE user_id = ? AND id = ?',
            [userId, personalityId],
            async (err, personality) => {
              if (err) {
                socket.emit('error', { error: 'Failed to fetch personality' });
                return;
              }

              // Build context and generate response
              let context = '';
              if (knowledgeBase.length > 0) {
                context = 'Custom Knowledge:\n' + knowledgeBase.map(k => k.content).join('\n\n') + '\n\n';
              }

              let personalityPrompt = '';
              if (personality) {
                personalityPrompt = `Personality: ${personality.description}\nTraits: ${personality.traits}\n\n`;
              } else {
                personalityPrompt = `You are a friendly, empathetic AI companion. Be supportive, caring, and engaging in conversation. Always respond in a warm and personal manner.\n\n`;
              }

              const systemPrompt = personalityPrompt + context + 
                'Instructions: Respond as a caring AI companion. Use the custom knowledge when relevant to provide helpful and accurate information. Keep responses conversational and engaging.';

              const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: message }
                ],
                max_tokens: 500,
                temperature: 0.7
              });

              const aiResponse = completion.choices[0].message.content;

              // Save messages
              const messageId = uuidv4();
              const aiMessageId = uuidv4();

              db.serialize(() => {
                d