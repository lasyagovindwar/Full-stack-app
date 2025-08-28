import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Async thunks
export const fetchSessions = createAsyncThunk(
  'sessions/fetchSessions',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/sessions/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.detail || 'Failed to fetch sessions')
      }
      
      const data = await response.json()
      return data.sessions
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createSession = createAsyncThunk(
  'sessions/createSession',
  async (sessionData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/sessions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sessionData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.detail || 'Failed to create session')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteSession = createAsyncThunk(
  'sessions/deleteSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.detail || 'Failed to delete session')
      }
      
      return sessionId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  sessions: [],
  currentSession: null,
  loading: false,
  error: null,
}

const sessionSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload
    },
    clearCurrentSession: (state) => {
      state.currentSession = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sessions
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false
        state.sessions = action.payload
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create session
      .addCase(createSession.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.loading = false
        state.sessions.unshift(action.payload)
        state.currentSession = action.payload
      })
      .addCase(createSession.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete session
      .addCase(deleteSession.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.loading = false
        state.sessions = state.sessions.filter(s => s.id !== action.payload)
        if (state.currentSession?.id === action.payload) {
          state.currentSession = null
        }
      })
      .addCase(deleteSession.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setCurrentSession, clearCurrentSession, clearError } = sessionSlice.actions
export default sessionSlice.reducer
