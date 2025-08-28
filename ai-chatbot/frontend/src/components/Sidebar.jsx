import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { deleteSession } from '../store/slices/sessionSlice'
import { clearMessages } from '../store/slices/messageSlice'
import { setCurrentProvider, setCurrentModel } from '../store/slices/uiSlice'
import '../styles/Sidebar.css'

const Sidebar = ({ 
  user, 
  sessions, 
  currentSession, 
  onNewSession, 
  onSessionSelect, 
  onLogout,
  isOpen,
  onToggle,
  isMobile
}) => {
  const dispatch = useDispatch()
  const { currentProvider, currentModel, providers } = useSelector((state) => state.ui)
  const [searchTerm, setSearchTerm] = useState('')
  
  const handleSessionDelete = async (sessionId, e) => {
    e.stopPropagation()
    await dispatch(deleteSession(sessionId))
    dispatch(clearMessages(sessionId))
  }
  
  const handleProviderChange = (provider) => {
    dispatch(setCurrentProvider(provider))
  }
  
  const handleModelChange = (model) => {
    dispatch(setCurrentModel(model))
  }
  
  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }
  
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <button className="sidebar-toggle" onClick={onToggle}>
          <span>☰</span>
        </button>
        <h2>AI Chatbot</h2>
      </div>
      
      <div className="user-profile">
        <div className="user-avatar">
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <div className="username">{user?.username}</div>
          <div className="user-email">{user?.email}</div>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <span>🚪</span>
        </button>
      </div>
      
      <div className="provider-selector">
        <label>AI Provider:</label>
        <select 
          value={currentProvider} 
          onChange={(e) => handleProviderChange(e.target.value)}
        >
          {Object.entries(providers).map(([key, provider]) => (
            <option key={key} value={key}>
              {provider.name}
            </option>
          ))}
        </select>
        
        <label>Model:</label>
        <select 
          value={currentModel} 
          onChange={(e) => handleModelChange(e.target.value)}
        >
          {providers[currentProvider]?.models.map(model => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>
      
      <button className="new-session-btn" onClick={onNewSession}>
        + New Chat
      </button>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search sessions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="sessions-list">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className={`session-item ${currentSession?.id === session.id ? 'active' : ''}`}
            onClick={() => onSessionSelect(session)}
          >
            <div className="session-info">
              <div className="session-title">{session.title}</div>
              <div className="session-meta">
                <span className="session-provider">{session.provider}</span>
                <span className="session-date">{formatDate(session.updated_at)}</span>
              </div>
            </div>
            <button
              className="delete-session-btn"
              onClick={(e) => handleSessionDelete(session.id, e)}
              title="Delete session"
            >
              🗑️
            </button>
          </div>
        ))}
        
        {filteredSessions.length === 0 && (
          <div className="no-sessions">
            {searchTerm ? 'No sessions found' : 'No sessions yet'}
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar
