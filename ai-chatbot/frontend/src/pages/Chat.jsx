import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSessions, createSession } from '../store/slices/sessionSlice'
import { fetchMessages } from '../store/slices/messageSlice'
import { logout } from '../store/slices/authSlice'
import { setSidebarOpen } from '../store/slices/uiSlice'
import Sidebar from '../components/Sidebar'
import ChatArea from '../components/ChatArea'
import '../styles/Chat.css'

const Chat = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { sessions, currentSession } = useSelector((state) => state.sessions)
  const { sidebarOpen } = useSelector((state) => state.ui)
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  
  useEffect(() => {
    dispatch(fetchSessions())
    
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (mobile) {
        dispatch(setSidebarOpen(false))
      } else {
        dispatch(setSidebarOpen(true))
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [dispatch])
  
  const handleNewSession = async () => {
    const sessionData = {
      title: 'New Chat',
      provider: 'openai',
      model: 'gpt-3.5-turbo'
    }
    await dispatch(createSession(sessionData))
  }
  
  const handleLogout = () => {
    dispatch(logout())
  }
  
  const handleSessionSelect = (session) => {
    dispatch(fetchMessages(session.id))
  }
  
  return (
    <div className="chat-container">
      <Sidebar
        user={user}
        sessions={sessions}
        currentSession={currentSession}
        onNewSession={handleNewSession}
        onSessionSelect={handleSessionSelect}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onToggle={() => dispatch(setSidebarOpen(!sidebarOpen))}
        isMobile={isMobile}
      />
      
      <div className={`chat-main ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        <ChatArea
          currentSession={currentSession}
          isMobile={isMobile}
        />
      </div>
      
      {isMobile && sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}
    </div>
  )
}

export default Chat
