import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, 
  FiEdit3, 
  FiTrash2, 
  FiPlus,
  FiSave,
  FiX
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const PersonalityContainer = styled.div`
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

const PersonalityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const PersonalityCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const CardTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CardIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.2rem;
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;

  &.edit {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    
    &:hover {
      background: rgba(102, 126, 234, 0.2);
    }
  }

  &.delete {
    background: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
    
    &:hover {
      background: rgba(231, 76, 60, 0.2);
    }
  }
`;

const CardContent = styled.div`
  margin-bottom: 20px;
`;

const Description = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
`;

const Traits = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Trait = styled.span`
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const CreateButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 30px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 30px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 5px;
  
  &:hover {
    color: #333;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div``;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const TraitsInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background: #f8f9fa;
  min-height: 50px;
`;

const TraitTag = styled.span`
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const RemoveTrait = styled.button`
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-size: 0.8rem;
  
  &:hover {
    color: #e74c3c;
  }
`;

const AddTraitInput = styled.input`
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
  min-width: 100px;
  
  &::placeholder {
    color: #999;
  }
`;

const SubmitButton = styled(motion.button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  color: #ddd;
  margin-bottom: 20px;
`;

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #333;
`;

const EmptyText = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto;
`;

function Personality({ user }) {
  const [personalities, setPersonalities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPersonality, setEditingPersonality] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    traits: []
  });
  const [newTrait, setNewTrait] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPersonalities();
  }, []);

  const fetchPersonalities = async () => {
    try {
      const response = await axios.get(`/api/personality/${user.userId}`);
      const personalities = response.data.map(p => ({
        ...p,
        traits: typeof p.traits === 'string' ? JSON.parse(p.traits) : p.traits
      }));
      setPersonalities(personalities);
    } catch (error) {
      console.error('Error fetching personalities:', error);
      toast.error('Failed to load personalities');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) return;

    setLoading(true);
    try {
      if (editingPersonality) {
        // Update existing personality
        await axios.put(`/api/personality/${editingPersonality.id}`, formData);
        toast.success('Personality updated successfully!');
      } else {
        // Create new personality
        await axios.post('/api/personality', { ...formData, userId: user.userId });
        toast.success('Personality created successfully!');
      }
      
      setShowModal(false);
      setEditingPersonality(null);
      setFormData({ name: '', description: '', traits: [] });
      fetchPersonalities();
    } catch (error) {
      console.error('Error saving personality:', error);
      toast.error('Failed to save personality');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (personality) => {
    setEditingPersonality(personality);
    setFormData({
      name: personality.name,
      description: personality.description,
      traits: [...personality.traits]
    });
    setShowModal(true);
  };

  const handleDelete = async (personalityId) => {
    if (window.confirm('Are you sure you want to delete this personality?')) {
      try {
        await axios.delete(`/api/personality/${personalityId}`);
        toast.success('Personality deleted successfully!');
        fetchPersonalities();
      } catch (error) {
        console.error('Error deleting personality:', error);
        toast.error('Failed to delete personality');
      }
    }
  };

  const addTrait = () => {
    if (newTrait.trim() && !formData.traits.includes(newTrait.trim())) {
      setFormData({
        ...formData,
        traits: [...formData.traits, newTrait.trim()]
      });
      setNewTrait('');
    }
  };

  const removeTrait = (traitToRemove) => {
    setFormData({
      ...formData,
      traits: formData.traits.filter(trait => trait !== traitToRemove)
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTrait();
    }
  };

  return (
    <PersonalityContainer>
      <Header>
        <Title>AI Personality</Title>
        <Subtitle>Customize how your AI companion behaves and responds</Subtitle>
      </Header>

      <CreateButton
        onClick={() => setShowModal(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <FiPlus />
        Create New Personality
      </CreateButton>

      <PersonalityGrid>
        <AnimatePresence>
          {personalities.map((personality, index) => (
            <PersonalityCard
              key={personality.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CardHeader>
                <CardTitle>
                  <CardIcon>
                    <FiUser />
                  </CardIcon>
                  {personality.name}
                </CardTitle>
                <CardActions>
                  <ActionButton
                    className="edit"
                    onClick={() => handleEdit(personality)}
                  >
                    <FiEdit3 />
                  </ActionButton>
                  <ActionButton
                    className="delete"
                    onClick={() => handleDelete(personality.id)}
                  >
                    <FiTrash2 />
                  </ActionButton>
                </CardActions>
              </CardHeader>

              <CardContent>
                <Description>{personality.description}</Description>
                <Traits>
                  {personality.traits.map((trait, index) => (
                    <Trait key={index}>{trait}</Trait>
                  ))}
                </Traits>
              </CardContent>
            </PersonalityCard>
          ))}
        </AnimatePresence>
      </PersonalityGrid>

      {personalities.length === 0 && (
        <EmptyState>
          <EmptyIcon>
            <FiUser />
          </EmptyIcon>
          <EmptyTitle>No Personalities Yet</EmptyTitle>
          <EmptyText>
            Create your first AI personality to customize how your companion behaves, 
            responds, and interacts with you.
          </EmptyText>
        </EmptyState>
      )}

      <AnimatePresence>
        {showModal && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <ModalHeader>
                <ModalTitle>
                  {editingPersonality ? 'Edit Personality' : 'Create New Personality'}
                </ModalTitle>
                <CloseButton onClick={() => setShowModal(false)}>
                  <FiX />
                </CloseButton>
              </ModalHeader>

              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter personality name"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe how this personality should behave..."
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Traits</Label>
                  <TraitsInput>
                    {formData.traits.map((trait, index) => (
                      <TraitTag key={index}>
                        {trait}
                        <RemoveTrait onClick={() => removeTrait(trait)}>
                          <FiX />
                        </RemoveTrait>
                      </TraitTag>
                    ))}
                    <AddTraitInput
                      type="text"
                      value={newTrait}
                      onChange={(e) => setNewTrait(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add trait..."
                    />
                  </TraitsInput>
                </FormGroup>

                <SubmitButton
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Saving...' : (editingPersonality ? 'Update' : 'Create')}
                </SubmitButton>
              </Form>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </PersonalityContainer>
  );
}

export default Personality; 