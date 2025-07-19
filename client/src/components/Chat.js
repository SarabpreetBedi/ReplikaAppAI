import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSend, 
  FiPlus, 
  FiMessageCircle,
  FiUser,
  FiSmartphone
} from 'react-icons/fi';
import io from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';

const ChatContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
`;

const ChatHeader = styled.div`
  padding: 20px 30px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.9);
`;

const HeaderTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const NewChatButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Message = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 80%;
  align-self: ${props => props.sender === 'user' ? 'flex-end' : 'flex-start'};
`;

const MessageAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  background: ${props => props.sender === 'user' 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  };
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  background: ${props => props.sender === 'user' 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'rgba(255, 255, 255, 0.9)'
  };
  color: ${props => props.sender === 'user' ? 'white' : '#333'};
  padding: 15px 20px;
  border-radius: 18px;
  border-bottom-right-radius: ${props => props.sender === 'user' ? '5px' : '18px'};
  border-bottom-left-radius: ${props => props.sender === 'user' ? '18px' : '5px'};
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  line-height: 1.5;
  word-wrap: break-word;
  max-width: 100%;
`;

const MessageTime = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-top: 5px;
  text-align: ${props => props.sender === 'user' ? 'right' : 'left'};
`;

const InputContainer = styled.div`
  padding: 20px 30px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.9);
`;

const InputForm = styled.form`
  display: flex;
  gap: 15px;
  align-items: flex-end;
`;

const MessageInput = styled.textarea`
  flex: 1;
  padding: 15px 20px;
  border: 2px solid #e1e5e9;
  border-radius: 25px;
  font-size: 1rem;
  resize: none;
  min-height: 50px;
  max-height: 120px;
  font-family: inherit;
  transition: all 0.3s ease;
  background: #f8f9fa;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const SendButton = styled(motion.button)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 15px 20px;
  color: #666;
  font-style: italic;
`;

const TypingDots = styled.div`
  display: flex;
  gap: 4px;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: typing 1.4s infinite ease-in-out;

  &:nth-child(1) { animation-delay: -0.32s; }
  &:nth-child(2) { animation-delay: -0.16s; }
  &:nth-child(3) { animation-delay: 0s; }

  @keyframes typing {
    0%, 80%, 100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const WelcomeMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

const WelcomeTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #333;
`;

const WelcomeText = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto;
`;

function Chat({ user }) {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    if (conversationId) {
      newSocket.emit('join-conversation', conversationId);
      fetchMessages();
    }

    newSocket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
      setTyping(false);
    });

    newSocket.on('error', (error) => {
      toast.error(error.error);
    });

    return () => newSocket.close();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/messages/${conversationId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await axios.post('/api/conversations', {
        userId: user.userId,
        title: 'New Conversation'
      });
      navigate(`/chat/${response.data.conversationId}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setLoading(true);
    setTyping(true);

    if (!conversationId) {
      // Create new conversation
      try {
        const response = await axios.post('/api/conversations', {
          userId: user.userId,
          title: messageText.substring(0, 50) + '...'
        });
        navigate(`/chat/${response.data.conversationId}`);
        
        // Send message after navigation
        setTimeout(() => {
          socket.emit('send-message', {
            message: messageText,
            conversationId: response.data.conversationId,
            userId: user.userId,
            personalityId: null
          });
        }, 100);
      } catch (error) {
        console.error('Error creating conversation:', error);
        toast.error('Failed to create conversation');
        setLoading(false);
        setTyping(false);
      }
    } else {
      // Send message to existing conversation
      socket.emit('send-message', {
        message: messageText,
        conversationId,
        userId: user.userId,
        personalityId: null
      });
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!conversationId) {
    return (
      <ChatContainer>
        <ChatHeader>
          <HeaderTitle>
            <FiMessageCircle />
            New Chat
          </HeaderTitle>
        </ChatHeader>
        <WelcomeMessage>
          <WelcomeTitle>Start a New Conversation</WelcomeTitle>
          <WelcomeText>
            Begin chatting with your AI companion. Share your thoughts, ask questions, 
            or just have a casual conversation. Your AI will remember your preferences 
            and use your custom knowledge to provide personalized responses.
          </WelcomeText>
        </WelcomeMessage>
        <InputContainer>
          <InputForm onSubmit={handleSubmit}>
            <MessageInput
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={1}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <SendButton
              type="submit"
              disabled={!newMessage.trim() || loading}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiSend />
            </SendButton>
          </InputForm>
        </InputContainer>
      </ChatContainer>
    );
  }

  return (
    <ChatContainer>
      <ChatHeader>
        <HeaderTitle>
          <FiMessageCircle />
          Chat
        </HeaderTitle>
        <NewChatButton
          onClick={createNewConversation}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiPlus />
          New Chat
        </NewChatButton>
      </ChatHeader>

      <MessagesContainer>
        <AnimatePresence>
          {messages.map((message, index) => (
            <Message
              key={message.id || index}
              sender={message.sender}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MessageAvatar sender={message.sender}>
                {message.sender === 'user' ? <FiUser /> : <FiSmartphone />}
              </MessageAvatar>
              <div>
                <MessageContent sender={message.sender}>
                  {message.content}
                </MessageContent>
                <MessageTime sender={message.sender}>
                  {formatTime(message.timestamp)}
                </MessageTime>
              </div>
            </Message>
          ))}
        </AnimatePresence>

        {typing && (
          <Message sender="ai">
            <MessageAvatar sender="ai">
              <FiSmartphone />
            </MessageAvatar>
            <div>
              <TypingIndicator>
                AI is typing
                <TypingDots>
                  <Dot />
                  <Dot />
                  <Dot />
                </TypingDots>
              </TypingIndicator>
            </div>
          </Message>
        )}

        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <InputForm onSubmit={handleSubmit}>
          <MessageInput
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
            rows={1}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <SendButton
            type="submit"
            disabled={!newMessage.trim() || loading}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiSend />
          </SendButton>
        </InputForm>
      </InputContainer>
    </ChatContainer>
  );
}

export default Chat; 