import React, { useState, useRef, useEffect } from 'react'
import '../styles/MessageInput.css'

const MessageInput = ({ onSendMessage, onStopGeneration, isStreaming, disabled }) => {
  const [message, setMessage] = useState('')
  const textareaRef = useRef(null)
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [message])
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }
  
  const handleStop = () => {
    onStopGeneration()
  }
  
  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-input-form">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            className="message-textarea"
            rows={1}
            disabled={disabled || isStreaming}
          />
          
          <div className="input-actions">
            {isStreaming ? (
              <button
                type="button"
                onClick={handleStop}
                className="stop-button"
                title="Stop generation"
              >
                ⏹️ Stop
              </button>
            ) : (
              <button
                type="submit"
                className="send-button"
                disabled={!message.trim() || disabled}
                title="Send message"
              >
                📤 Send
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default MessageInput
