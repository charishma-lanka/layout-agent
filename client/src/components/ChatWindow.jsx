// client/src/components/ChatWindow.jsx
import { useRef, useEffect } from 'react';

export default function ChatWindow({ messages, loading }) {
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-messages">
      {messages.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>Start a conversation</h3>
          <p>Try these commands:</p>
          <div className="suggestion-chips">
            <button className="chip">Convert this to 9:16</button>
            <button className="chip">Make the headline smaller</button>
            <button className="chip">Move offer badge higher</button>
            <button className="chip">Change headline color to red</button>
            <button className="chip">Center the product</button>
          </div>
        </div>
      )}
      
      {messages.map((msg, idx) => (
        <div key={idx} className={`message ${msg.role}`}>
          <div className="message-avatar">
            {msg.role === 'user' ? '👤' : '✨'}
          </div>
          <div className="message-content">
            <div className="message-bubble">
              {msg.content}
            </div>
            <div className="message-time">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      ))}
      
      {loading && (
        <div className="message assistant">
          <div className="message-avatar">✨</div>
          <div className="message-content">
            <div className="message-bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}