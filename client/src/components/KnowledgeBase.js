import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUpload, 
  FiFile, 
  FiTrash2, 
  FiEye,
  FiDownload,
  FiPlus
} from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';

const KnowledgeContainer = styled.div`
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

const UploadSection = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const UploadTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
`;

const Dropzone = styled.div`
  border: 2px dashed #667eea;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(102, 126, 234, 0.05);

  &:hover {
    border-color: #764ba2;
    background: rgba(102, 126, 234, 0.1);
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 15px;
`;

const UploadText = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 10px;
`;

const UploadHint = styled.p`
  color: #999;
  font-size: 0.9rem;
`;

const FileInput = styled.input`
  display: none;
`;

const UploadForm = styled.form`
  margin-top: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

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

const UploadButton = styled(motion.button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 30px;
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

const DocumentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const DocumentCard = styled(motion.div)`
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

const DocumentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
`;

const DocumentIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const DocumentInfo = styled.div`
  flex: 1;
`;

const DocumentTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
`;

const DocumentMeta = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const DocumentContent = styled.div`
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
  max-height: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
`;

const DocumentActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &.view {
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

function KnowledgeBase({ user }) {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`/api/knowledge/${user.userId}`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    }
  };

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setDocumentTitle(acceptedFiles[0].name.replace(/\.[^/.]+$/, ''));
      setShowUploadForm(true);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt']
    },
    multiple: false
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !documentTitle.trim()) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('userId', user.userId);
    formData.append('title', documentTitle);

    try {
      await axios.post('/api/knowledge/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Document uploaded successfully!');
      setSelectedFile(null);
      setDocumentTitle('');
      setShowUploadForm(false);
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        // Note: You'll need to add a delete endpoint to your server
        // await axios.delete(`/api/knowledge/${documentId}`);
        toast.success('Document deleted successfully!');
        fetchDocuments();
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error('Failed to delete document');
      }
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('docx')) return '📝';
    if (fileType.includes('text')) return '📄';
    return '📄';
  };

  return (
    <KnowledgeContainer>
      <Header>
        <Title>Knowledge Base</Title>
        <Subtitle>Upload documents to teach your AI companion</Subtitle>
      </Header>

      <UploadSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <UploadTitle>Upload New Document</UploadTitle>
        
        {!showUploadForm ? (
          <Dropzone {...getRootProps()}>
            <FileInput {...getInputProps()} />
            <UploadIcon>
              <FiUpload />
            </UploadIcon>
            <UploadText>
              {isDragActive
                ? 'Drop the file here...'
                : 'Drag & drop a file here, or click to select'
              }
            </UploadText>
            <UploadHint>
              Supports PDF, Word documents, and text files
            </UploadHint>
          </Dropzone>
        ) : (
          <UploadForm onSubmit={handleUpload}>
            <FormGroup>
              <Label>Document Title</Label>
              <Input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Enter document title"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Selected File</Label>
              <div style={{ 
                padding: '10px', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FiFile />
                {selectedFile?.name}
              </div>
            </FormGroup>

            <div style={{ display: 'flex', gap: '10px' }}>
              <UploadButton
                type="submit"
                disabled={uploading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </UploadButton>
              
              <motion.button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setDocumentTitle('');
                  setShowUploadForm(false);
                }}
                style={{
                  padding: '12px 20px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#666',
                  cursor: 'pointer'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </div>
          </UploadForm>
        )}
      </UploadSection>

      <DocumentsGrid>
        <AnimatePresence>
          {documents.map((doc, index) => (
            <DocumentCard
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DocumentHeader>
                <DocumentIcon>
                  {getFileIcon(doc.file_type)}
                </DocumentIcon>
                <DocumentInfo>
                  <DocumentTitle>{doc.title}</DocumentTitle>
                  <DocumentMeta>
                    {new Date(doc.created_at).toLocaleDateString()} • {doc.file_type}
                  </DocumentMeta>
                </DocumentInfo>
              </DocumentHeader>

              <DocumentContent>
                {doc.content.substring(0, 200)}...
              </DocumentContent>

              <DocumentActions>
                <ActionButton className="view">
                  <FiEye />
                  View
                </ActionButton>
                <ActionButton className="delete" onClick={() => handleDelete(doc.id)}>
                  <FiTrash2 />
                  Delete
                </ActionButton>
              </DocumentActions>
            </DocumentCard>
          ))}
        </AnimatePresence>
      </DocumentsGrid>

      {documents.length === 0 && (
        <EmptyState>
          <EmptyIcon>
            <FiFile />
          </EmptyIcon>
          <EmptyTitle>No Documents Yet</EmptyTitle>
          <EmptyText>
            Upload your first document to start teaching your AI companion. 
            You can upload PDFs, Word documents, and text files.
          </EmptyText>
        </EmptyState>
      )}
    </KnowledgeContainer>
  );
}

export default KnowledgeBase; 