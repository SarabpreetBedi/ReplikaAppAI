import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiMessageCircle, 
  FiBook, 
  FiUser, 
  FiPlus,
  FiTrendingUp,
  FiClock
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const DashboardContainer = styled.div`
  padding: 30px;
  height: 100vh;
  overflow-y: auto;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  background: ${props => {
    switch (props.type) {
      case 'conversations': return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'knowledge': return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      case 'personality': return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      default: return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  }};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const ActionCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
`;

const ActionIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const ActionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
`;

const ActionDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const ActionButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }
`;

const RecentActivity = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ActivityTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  font-size: 1.1rem;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityText = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
`;

const ActivityTime = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    conversations: 0,
    knowledge: 0,
    personality: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch conversations
      const conversationsResponse = await axios.get(`/api/conversations/${user.userId}`);
      
      // Fetch knowledge base
      const knowledgeResponse = await axios.get(`/api/knowledge/${user.userId}`);
      
      setStats({
        conversations: conversationsResponse.data.length,
        knowledge: knowledgeResponse.data.length,
        personality: 1 // Default personality
      });

      // Mock recent activity
      setRecentActivity([
        {
          id: 1,
          type: 'conversation',
          text: 'Started a new conversation',
          time: '2 minutes ago',
          icon: FiMessageCircle
        },
        {
          id: 2,
          type: 'knowledge',
          text: 'Uploaded new knowledge document',
          time: '1 hour ago',
          icon: FiBook
        },
        {
          id: 3,
          type: 'personality',
          text: 'Updated AI personality settings',
          time: '3 hours ago',
          icon: FiUser
        }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div className="spinner"></div>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <Title>Welcome back, {user.username}!</Title>
        <Subtitle>Here's what's happening with your AI companion</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatHeader>
            <StatIcon type="conversations">
              <FiMessageCircle />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.conversations}</StatValue>
          <StatLabel>Conversations</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatHeader>
            <StatIcon type="knowledge">
              <FiBook />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.knowledge}</StatValue>
          <StatLabel>Knowledge Documents</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <StatHeader>
            <StatIcon type="personality">
              <FiUser />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.personality}</StatValue>
          <StatLabel>Personality Profiles</StatLabel>
        </StatCard>
      </StatsGrid>

      <ActionsGrid>
        <ActionCard
          as={Link}
          to="/chat"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ActionIcon>
            <FiMessageCircle />
          </ActionIcon>
          <ActionTitle>Start Chatting</ActionTitle>
          <ActionDescription>
            Begin a new conversation with your AI companion. Share your thoughts, ask questions, or just chat about your day.
          </ActionDescription>
          <ActionButton to="/chat">
            <FiPlus />
            New Chat
          </ActionButton>
        </ActionCard>

        <ActionCard
          as={Link}
          to="/knowledge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ActionIcon>
            <FiBook />
          </ActionIcon>
          <ActionTitle>Add Knowledge</ActionTitle>
          <ActionDescription>
            Upload documents, articles, or notes to teach your AI companion about topics that matter to you.
          </ActionDescription>
          <ActionButton to="/knowledge">
            <FiPlus />
            Upload Document
          </ActionButton>
        </ActionCard>

        <ActionCard
          as={Link}
          to="/personality"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ActionIcon>
            <FiUser />
          </ActionIcon>
          <ActionTitle>Customize Personality</ActionTitle>
          <ActionDescription>
            Define how your AI companion should behave, respond, and interact with you.
          </ActionDescription>
          <ActionButton to="/personality">
            <FiPlus />
            Create Personality
          </ActionButton>
        </ActionCard>
      </ActionsGrid>

      <RecentActivity
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <ActivityTitle>
          <FiClock />
          Recent Activity
        </ActivityTitle>
        {recentActivity.map((activity) => (
          <ActivityItem key={activity.id}>
            <ActivityIcon>
              <activity.icon />
            </ActivityIcon>
            <ActivityContent>
              <ActivityText>{activity.text}</ActivityText>
              <ActivityTime>{activity.time}</ActivityTime>
            </ActivityContent>
          </ActivityItem>
        ))}
      </RecentActivity>
    </DashboardContainer>
  );
}

export default Dashboard; 