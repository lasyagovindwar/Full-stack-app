import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sidebarOpen: true,
  isStreaming: false,
  currentProvider: 'openai',
  currentModel: 'gpt-3.5-turbo',
  providers: {
    openai: {
      name: 'OpenAI',
      models: ['gpt-3.5-turbo', 'gpt-3.5-turbo-16k', 'gpt-4', 'gpt-4-turbo-preview', 'gpt-4-32k']
    },
    anthropic: {
      name: 'Anthropic Claude',
      models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307']
    },
    google: {
      name: 'Google Gemini',
      models: ['gemini-pro', 'gemini-pro-vision', 'gemini-flash']
    },
    ollama: {
      name: 'Ollama (Local)',
      models: ['llama2', 'mistral', 'codellama', 'neural-chat']
    }
  }
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    setIsStreaming: (state, action) => {
      state.isStreaming = action.payload
    },
    setCurrentProvider: (state, action) => {
      state.currentProvider = action.payload
      // Set default model for provider
      const provider = state.providers[action.payload]
      if (provider && provider.models.length > 0) {
        state.currentModel = provider.models[0]
      }
    },
    setCurrentModel: (state, action) => {
      state.currentModel = action.payload
    },
    updateProviders: (state, action) => {
      state.providers = { ...state.providers, ...action.payload }
    }
  },
})

export const { 
  toggleSidebar, 
  setSidebarOpen, 
  setIsStreaming, 
  setCurrentProvider, 
  setCurrentModel,
  updateProviders 
} = uiSlice.actions

export default uiSlice.reducer
