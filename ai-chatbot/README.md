# AI Chatbot - Full Stack Application

A modern, full-stack AI chatbot application with support for multiple AI providers including OpenAI, Anthropic Claude, Google Gemini, and Ollama (local).

## Features

- **Multi-Provider AI Support**: Switch between OpenAI GPT models, Anthropic Claude, Google Gemini, and local Ollama
- **Real-time Streaming**: Token-by-token AI response streaming with Server-Sent Events (SSE)
- **Session Management**: Create, manage, and organize chat sessions with timestamps
- **User Authentication**: JWT-based authentication system with secure password hashing
- **Responsive Design**: Mobile-first responsive UI that works on all devices
- **Modern UI**: Beautiful, intuitive interface with CSS-only styling (no UI libraries)
- **State Management**: Redux Toolkit for efficient state management
- **Performance**: Optimized for speed with async operations and streaming

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Redis (optional)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
createdb ai_chatbot
alembic upgrade head
python main.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Project Structure

```
ai-chatbot/
├── backend/                 # FastAPI backend
├── frontend/               # React frontend
├── database/               # Database scripts
└── docs/                   # Documentation
```

## License

This project is licensed under the MIT License.
