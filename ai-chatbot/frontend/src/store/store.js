import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import sessionReducer from './slices/sessionSlice'
import messageReducer from './slices/messageSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sessions: sessionReducer,
    messages: messageReducer,
    ui: uiReducer,
  },
})
