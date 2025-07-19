import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import styled from 'styled-components';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import KnowledgeBase from './components/KnowledgeBase';
import Personality from './components/Personality';
import Sidebar from './components/Sidebar';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Router>
        <AuthContainer>
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthContainer>
        <Toaster position="top-right" />
      </Router>
    );
  }

  return (
    <Router>
      <AppContainer>
        <Sidebar user={user} onLogout={handleLogout} />
        <MainContent>
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/chat/:conversationId?" element={<Chat user={user} />} />
            <Route path="/knowledge" element={<KnowledgeBase user={user} />} />
            <Route path="/personality" element={<Personality user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainContent>
      </AppContainer>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App; 