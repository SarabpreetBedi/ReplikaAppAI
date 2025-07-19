import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiMessageCircle, 
  FiBook, 
  FiUser, 
  FiLogOut, 
  FiHome,
  FiSettings
} from 'react-icons/fi';

const SidebarContainer = styled(motion.div)`
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 40px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const NavMenu = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  border-radius: 12px;
  color: ${props => props.active ? '#667eea' : '#666'};
  background: ${props => props.active ? 'rgba(102, 126, 234, 0.1)' : 'transparent'};
  font-weight: ${props => props.active ? '600' : '500'};
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    transform: translateX(5px);
  }

  svg {
    font-size: 1.2rem;
  }
`;

const UserSection = styled.div`
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 20px;
  margin-top: auto;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  margin-bottom: 15px;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
`;

const UserStatus = styled.div`
  font-size: 0.8rem;
  color: #27ae60;
  font-weight: 500;
`;

const LogoutButton = styled(motion.button)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #c0392b;
    transform: translateY(-2px);
  }
`;

const MenuItem = ({ to, icon: Icon, children, active }) => (
  <NavItem to={to} active={active}>
    <Icon />
    {children}
  </NavItem>
);

function Sidebar({ user, onLogout }) {
  const location = useLocation();

  const menuItems = [
    { to: '/', icon: FiHome, label: 'Dashboard' },
    { to: '/chat', icon: FiMessageCircle, label: 'Chat' },
    { to: '/knowledge', icon: FiBook, label: 'Knowledge Base' },
    { to: '/personality', icon: FiUser, label: 'Personality' },
  ];

  return (
    <SidebarContainer
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Logo>Replika</Logo>
      
      <NavMenu>
        {menuItems.map((item) => (
          <MenuItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            active={location.pathname === item.to || 
                    (item.to === '/chat' && location.pathname.startsWith('/chat'))}
          >
            {item.label}
          </MenuItem>
        ))}
      </NavMenu>

      <UserSection>
        <UserInfo>
          <UserAvatar>
            {user.username.charAt(0).toUpperCase()}
          </UserAvatar>
          <UserDetails>
            <UserName>{user.username}</UserName>
            <UserStatus>Online</UserStatus>
          </UserDetails>
        </UserInfo>
        
        <LogoutButton
          onClick={onLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiLogOut />
          Logout
        </LogoutButton>
      </UserSection>
    </SidebarContainer>
  );
}

export default Sidebar; 