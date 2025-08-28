import React from 'react'
import Message from './Message'
import '../styles/MessageList.css'

const MessageList = ({ messages, streamingMessage, isStreaming }) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  return (
    <div className="message-list">
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          timestamp={formatTime(message.created_at)}
        />
      ))}
      
      {isStreaming && streamingMessage && (
        <Message
          message={{
            id: 'streaming',
            role: 'assistant',
            content: streamingMessage,
            created_at: new Date().toISOString()
          }}
          timestamp={formatTime(new Date())}
          isStreaming={true}
        />
      )}
      
      {messages.length === 0 && !isStreaming && (
        <div className="no-messages">
          <p>No messages yet. Start a conversation!</p>
        </div>
      )}
    </div>
  )
}

export default MessageList
