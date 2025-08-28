import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Async thunks
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (sessionId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/messages/session/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.detail || 'Failed to fetch messages')
      }
      
      const data = await response.json()
      return { sessionId, messages: data.messages }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/messages/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(messageData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.detail || 'Failed to send message')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  messages: {},
  loading: false,
  error: null,
}

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      const { sessionId, message } = action.payload
      if (!state.messages[sessionId]) {
        state.messages[sessionId] = []
      }
      state.messages[sessionId].push(message)
    },
    updateMessage: (state, action) => {
      const { sessionId, messageId, updates } = action.payload
      if (state.messages[sessionId]) {
        const messageIndex = state.messages[sessionId].findIndex(m => m.id === messageId)
        if (messageIndex !== -1) {
          state.messages[sessionId][messageIndex] = { ...state.messages[sessionId][messageIndex], ...updates }
        }
      }
    },
    clearMessages: (state, action) => {
      const sessionId = action.payload
      if (sessionId) {
        delete state.messages[sessionId]
      } else {
        state.messages = {}
      }
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false
        const { sessionId, messages } = action.payload
        state.messages[sessionId] = messages
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false
        const message = action.payload
        const sessionId = message.session_id
        if (!state.messages[sessionId]) {
          state.messages[sessionId] = []
        }
        state.messages[sessionId].push(message)
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { addMessage, updateMessage, clearMessages, clearError } = messageSlice.actions
export default messageSlice.reducer
