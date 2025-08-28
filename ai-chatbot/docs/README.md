# AI Chatbot - Full Stack Application

A modern, full-stack AI chatbot application with support for multiple AI providers including OpenAI, Anthropic Claude, Google Gemini, and Ollama (local).

## Features

- **Multi-Provider Support**: Switch between OpenAI GPT models, Anthropic Claude, Google Gemini, and local Ollama
- **Real-time Streaming**: Token-by-token AI response streaming with SSE
- **Session Management**: Create, manage, and organize chat sessions
- **User Authentication**: JWT-based authentication system
- **Responsive Design**: Mobile-first responsive UI
- **Modern Tech Stack**: React.js frontend with Redux, FastAPI backend, PostgreSQL database

## Tech Stack

### Frontend
- React.js 18
- Redux Toolkit for state management
- CSS-only styling (no UI libraries)
- Vite for build tooling
- Responsive design with mobile-first approach

### Backend
- FastAPI (Python 3.8+)
- SQLAlchemy with async support
- PostgreSQL database
- JWT authentication
- Server-Sent Events (SSE) for streaming
- Modular architecture with routers and services

### Database
- PostgreSQL with async support
- Alembic for database migrations
- Connection pooling
- JSONB support for flexible metadata

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Redis (optional)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Set up the database:
   ```bash
   # Create PostgreSQL database
   createdb ai_chatbot
   
   # Run migrations
   alembic upgrade head
   ```

6. Start the backend server:
   ```bash
   python main.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:3000`

## Configuration

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost/ai_chatbot

# JWT
SECRET_KEY=your-super-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=["http://localhost:3000"]

# AI Providers
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
GOOGLE_API_KEY=your-google-api-key

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### AI Provider Setup

1. **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/)
2. **Anthropic**: Get your API key from [Anthropic Console](https://console.anthropic.com/)
3. **Google**: Get your API key from [Google AI Studio](https://aistudio.google.com/)
4. **Ollama**: Install and run locally with [Ollama](https://ollama.ai/)

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

## Project Structure

```
ai-chatbot/
├── backend/                 # FastAPI backend
│   ├── app/                # Application code
│   │   ├── core/          # Configuration and core utilities
│   │   ├── models/        # Database models
│   │   ├── routers/       # API route handlers
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # AI provider services
│   ├── alembic/           # Database migrations
│   ├── main.py            # Application entry point
│   └── requirements.txt   # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store and slices
│   │   └── styles/        # CSS stylesheets
│   ├── package.json       # Node.js dependencies
│   └── vite.config.js     # Vite configuration
├── database/               # Database scripts and models
└── docs/                   # Documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
