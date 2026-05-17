// client/src/App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import initialLayout from './data/file.json';
import ChatInput from './components/ChatInput';
import ChatWindow from './components/ChatWindow';
import JsonViewer from './components/JsonViewer';
import WireframePreview from './components/WireframePreview';
import './App.css';

function App() {
  const [layout, setLayout] = useState(initialLayout);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [darkMode, setDarkMode] = useState(false);

  const sendMessage = async (userMessage) => {
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/chat', {
        message: userMessage,
        layout: layout,
        history: messages.slice(-6)
      });

      if (response.data.success) {
        setLayout(response.data.updatedLayout);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.data.explanation 
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.data.explanation || 'Something went wrong.'
        }]);
      }
    } catch (error) {
      console.error('Frontend Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Connection error. Make sure the backend server is running on port 3001.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          <span className="logo-icon">🎨</span>
          <span className="logo-text">Layout Agent</span>
        </div>
        
        <div className="sidebar-nav">
          <button className="nav-item active">
            <span className="nav-icon">💬</span>
            <span>Chat</span>
          </button>
          <button className="nav-item">
            <span className="nav-icon">📐</span>
            <span>Preview</span>
          </button>
          <button className="nav-item">
            <span className="nav-icon">📋</span>
            <span>JSON</span>
          </button>
        </div>

        <button 
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="header-title">
            <h1>Layout Design Studio</h1>
            <p>AI-powered layout transformation</p>
          </div>
          <div className="header-stats">
            <div className="stat">
              <span className="stat-value">{Object.keys(layout.nodes).length}</span>
              <span className="stat-label">Elements</span>
            </div>
            <div className="stat">
              <span className="stat-value">{layout.nodes[layout.rootNodes[0]]?.width}×{layout.nodes[layout.rootNodes[0]]?.height}</span>
              <span className="stat-label">Canvas</span>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="workspace">
          {/* Chat Column */}
          <div className="chat-column">
            <div className="chat-header">
              <span className="chat-title">💬 Conversation</span>
              <button className="clear-chat" onClick={() => setMessages([])}>
                Clear
              </button>
            </div>
            <ChatWindow messages={messages} loading={loading} />
            <ChatInput onSend={sendMessage} disabled={loading} />
          </div>

          {/* Preview/JSON Column */}
          <div className="preview-column">
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                📐 Preview
              </button>
              <button 
                className={`tab ${activeTab === 'json' ? 'active' : ''}`}
                onClick={() => setActiveTab('json')}
              >
                📋 JSON
              </button>
            </div>
            
            <div className="tab-content">
              {activeTab === 'preview' && <WireframePreview layout={layout} />}
              {activeTab === 'json' && <JsonViewer layout={layout} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;