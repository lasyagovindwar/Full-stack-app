import React from 'react'
import '../styles/Message.css'

const Message = ({ message, timestamp, isStreaming = false }) => {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  
  return (
    <div className={`message ${isUser ? 'user' : 'assistant'} ${isStreaming ? 'streaming' : ''}`}>
      <div className="message-avatar">
        {isUser ? '👤' : '🤖'}
      </div>
      
      <div className="message-content">
        <div className="message-header">
          <span className="message-role">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          <span className="message-time">{timestamp}</span>
        </div>
        
        <div className="message-text">
          {message.content}
          {isStreaming && <span className="typing-indicator">▋</span>}
        </div>
        
        {message.provider && (
          <div className="message-meta">
            <span className="provider">{message.provider}</span>
            {message.model && <span className="model">{message.model}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

export default Message
