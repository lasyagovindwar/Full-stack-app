import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchMessages, addMessage } from '../store/slices/messageSlice'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import '../styles/ChatArea.css'

const ChatArea = ({ currentSession, isMobile }) => {
  const dispatch = useDispatch()
  const { messages } = useSelector((state) => state.messages)
  const { currentProvider, currentModel } = useSelector((state) => state.ui)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [eventSource, setEventSource] = useState(null)
  
  const messagesEndRef = useRef(null)
  
  useEffect(() => {
    if (currentSession) {
      dispatch(fetchMessages(currentSession.id))
    }
  }, [currentSession, dispatch])
  
  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const handleSendMessage = async (messageText) => {
    if (!currentSession || !messageText.trim()) return
    
    // Add user message to store
    const userMessage = {
      id: Date.now().toString(),
      session_id: currentSession.id,
      role: 'user',
      content: messageText,
      provider: currentProvider,
      model: currentModel,
      created_at: new Date().toISOString()
    }
    
    dispatch(addMessage({ sessionId: currentSession.id, message: userMessage }))
    
    // Start streaming
    setIsStreaming(true)
    setStreamingMessage('')
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          session_id: currentSession.id,
          message: messageText,
          provider: currentProvider,
          model: currentModel,
          stream: true
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to send message')
      }
      
      // Create EventSource for streaming
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'start') {
                // Start of response
                const assistantMessage = {
                  id: Date.now().toString() + '_streaming',
                  session_id: currentSession.id,
                  role: 'assistant',
                  content: '',
                  provider: currentProvider,
                  model: currentModel,
                  created_at: new Date().toISOString()
                }
                dispatch(addMessage({ sessionId: currentSession.id, message: assistantMessage }))
              } else if (data.type === 'token') {
                // Token received
                setStreamingMessage(prev => prev + data.content)
              } else if (data.type === 'complete') {
                // Response complete
                setIsStreaming(false)
                setStreamingMessage('')
                
                // Update the streaming message with final content
                dispatch(addMessage({
                  sessionId: currentSession.id,
                  message: {
                    id: data.message_id || Date.now().toString(),
                    session_id: currentSession.id,
                    role: 'assistant',
                    content: data.content,
                    provider: currentProvider,
                    model: currentModel,
                    created_at: new Date().toISOString()
                  }
                }))
                
                // Remove the temporary streaming message
                // This would need to be handled in the store
                return
              } else if (data.type === 'error') {
                // Error occurred
                setIsStreaming(false)
                setStreamingMessage('')
                console.error('Streaming error:', data.error)
                return
              }
            } catch (e) {
              console.error('Error parsing streaming data:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setIsStreaming(false)
      setStreamingMessage('')
    }
  }
  
  const handleStopGeneration = () => {
    if (eventSource) {
      eventSource.close()
      setEventSource(null)
    }
    setIsStreaming(false)
    setStreamingMessage('')
  }
  
  if (!currentSession) {
    return (
      <div className="chat-area-empty">
        <div className="empty-state">
          <h2>Welcome to AI Chatbot</h2>
          <p>Select a session or create a new one to start chatting</p>
        </div>
      </div>
    )
  }
  
  const sessionMessages = messages[currentSession.id] || []
  
  return (
    <div className="chat-area">
      <div className="chat-header">
        <h2>{currentSession.title}</h2>
        <div className="chat-meta">
          <span className="provider">{currentProvider}</span>
          <span className="model">{currentModel}</span>
        </div>
      </div>
      
      <MessageList 
        messages={sessionMessages}
        streamingMessage={streamingMessage}
        isStreaming={isStreaming}
      />
      
      <MessageInput
        onSendMessage={handleSendMessage}
        onStopGeneration={handleStopGeneration}
        isStreaming={isStreaming}
        disabled={!currentSession}
      />
      
      <div ref={messagesEndRef} />
    </div>
  )
}

export default ChatArea
