# Replika-like AI Companion App

A modern, full-stack AI companion application with custom knowledge capabilities, built with React, Node.js, and OpenAI.

## Features

### 🤖 AI Companion
- **Real-time Chat**: Instant messaging with your AI companion
- **Custom Knowledge Base**: Upload documents to teach your AI about specific topics
- **Personality Customization**: Create and customize AI personalities
- **Conversation Memory**: Persistent chat history and context

### 📚 Knowledge Management
- **Document Upload**: Support for PDF, Word documents, and text files
- **Content Extraction**: Automatic text extraction from uploaded files
- **Knowledge Integration**: AI uses your custom knowledge in conversations

### 🎭 Personality System
- **Custom Personalities**: Create multiple AI personalities
- **Trait Definition**: Define specific traits and behaviors
- **Personality Switching**: Switch between different AI personalities

### 🔐 User Management
- **User Registration & Login**: Secure authentication system
- **User Profiles**: Personalized experience for each user
- **Session Management**: Persistent login sessions

## Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database for data persistence
- **Socket.IO** for real-time communication
- **OpenAI API** for AI responses
- **Multer** for file uploads
- **JWT** for authentication

### Frontend
- **React 18** with functional components
- **Styled Components** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Socket.IO Client** for real-time features
- **React Hot Toast** for notifications

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ReplikaApp
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install

   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your-openai-api-key-here
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   #Install dependencies
   node setup.js
   # Start the server (from root directory)
   npm run dev

   # In a new terminal, start the client
   cd client
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Usage

### Getting Started
1. Register a new account or login with existing credentials
2. Start chatting with your AI companion
3. Upload documents to your knowledge base
4. Create custom personalities for different scenarios

### Features Guide

#### Chat Interface
- Real-time messaging with your AI companion
- Message history persistence
- Typing indicators
- Responsive design for all devices

#### Knowledge Base
- Upload PDF, Word documents, and text files
- Automatic content extraction and indexing
- AI uses your knowledge in conversations
- Document management and deletion

#### Personality Customization
- Create multiple AI personalities
- Define personality traits and behaviors
- Switch between personalities
- Customize AI responses and tone

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Conversations
- `GET /api/conversations/:userId` - Get user conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/messages/:conversationId` - Get conversation messages
- `POST /api/messages` - Save message

### Knowledge Base
- `POST /api/knowledge/upload` - Upload knowledge document
- `GET /api/knowledge/:userId` - Get user's knowledge base

### Chat
- `POST /api/chat` - Send message to AI
- Socket.IO events for real-time chat

## Database Schema

### Users
- `id` (TEXT, PRIMARY KEY)
- `username` (TEXT, UNIQUE)
- `email` (TEXT, UNIQUE)
- `password_hash` (TEXT)
- `created_at` (DATETIME)

### Conversations
- `id` (TEXT, PRIMARY KEY)
- `user_id` (TEXT, FOREIGN KEY)
- `title` (TEXT)
- `created_at` (DATETIME)

### Messages
- `id` (TEXT, PRIMARY KEY)
- `conversation_id` (TEXT, FOREIGN KEY)
- `content` (TEXT)
- `sender` (TEXT)
- `timestamp` (DATETIME)

### Knowledge Base
- `id` (TEXT, PRIMARY KEY)
- `user_id` (TEXT, FOREIGN KEY)
- `title` (TEXT)
- `content` (TEXT)
- `file_type` (TEXT)
- `file_path` (TEXT)
- `created_at` (DATETIME)

### Personality Settings
- `id` (TEXT, PRIMARY KEY)
- `user_id` (TEXT, FOREIGN KEY)
- `name` (TEXT)
- `description` (TEXT)
- `traits` (TEXT)
- `created_at` (DATETIME)

## File Structure

```
ReplikaApp/
├── server.js                 # Main server file
├── package.json             # Server dependencies
├── .env                     # Environment variables
├── client/                  # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   └── package.json        # Client dependencies
├── uploads/                 # File upload directory
└── replika.db              # SQLite database
```

## Customization

### Adding New File Types
1. Update the file upload configuration in `server.js`
2. Add parsing logic for the new file type
3. Update the frontend file type validation

### Customizing AI Responses
1. Modify the system prompts in the chat endpoints
2. Adjust the temperature and max_tokens parameters
3. Add custom context or instructions

### Styling
- Modify `client/src/index.css` for global styles
- Update styled components in individual components
- Customize the color scheme and gradients

## Security Considerations

- JWT tokens for authentication
- Password hashing with bcrypt
- Input validation and sanitization
- File upload restrictions
- CORS configuration
- Environment variable protection

## Performance Optimization

- Database indexing for faster queries
- File upload size limits
- Message pagination for large conversations
- Image optimization for avatars
- Lazy loading for components

## Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
# Build the React app
cd client
npm run build
cd ..

# Start production server
npm start
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure proper CORS origins
- Set up SSL certificates
- Configure database backups

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code comments

## Roadmap

- [ ] Voice chat capabilities
- [ ] Image generation integration
- [ ] Multi-language support
- [ ] Advanced personality training
- [ ] Mobile app development
- [ ] API rate limiting
- [ ] Advanced analytics
- [ ] Plugin system 