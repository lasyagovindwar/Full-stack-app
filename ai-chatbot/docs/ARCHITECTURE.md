# Architecture Documentation

## System Overview

The AI Chatbot is built as a modern, scalable full-stack application with a clear separation of concerns between frontend, backend, and database layers.

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ • Redux Store   │    │ • REST API      │    │ • Users         │
│ • Components    │    │ • SSE Streaming │    │ • Sessions      │
│ • Responsive UI │    │ • Auth Service  │    │ • Messages      │
└─────────────────┘    │ • AI Services   │    └─────────────────┘
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   AI Providers  │
                       │                 │
                       │ • OpenAI        │
                       │ • Anthropic     │
                       │ • Google Gemini │
                       │ • Ollama        │
                       └─────────────────┘
```

## Backend Architecture

### Core Components

1. **FastAPI Application** (`main.py`)
   - CORS middleware configuration
   - Router registration
   - Database initialization
   - Application lifespan management

2. **Configuration Management** (`app/core/config.py`)
   - Environment variable handling
   - Database connection strings
   - API keys and secrets
   - CORS origins

3. **Database Layer** (`app/database.py`)
   - SQLAlchemy async engine setup
   - Database session management
   - Model definitions
   - Connection pooling

### API Structure

The API is organized into logical routers:

- **Authentication Router** (`/api/auth`)
  - User registration and login
  - JWT token management
  - Password hashing with bcrypt

- **Sessions Router** (`/api/sessions`)
  - Chat session CRUD operations
  - User session management
  - Session metadata

- **Messages Router** (`/api/messages`)
  - Message storage and retrieval
  - Conversation history
  - Message metadata

- **Chat Router** (`/api/chat`)
  - AI provider integration
  - Streaming responses
  - Provider switching

### AI Service Architecture

The AI services follow a common interface pattern:

```python
class BaseAIService(ABC):
    @abstractmethod
    async def stream_chat(self, messages, model, **kwargs):
        pass
    
    @abstractmethod
    async def get_available_models(self):
        pass
    
    @abstractmethod
    async def validate_model(self, model):
        pass
```

Each provider implements this interface:
- **OpenAIService**: OpenAI GPT models
- **AnthropicService**: Claude models
- **GeminiService**: Google Gemini models
- **OllamaService**: Local Ollama models

### Streaming Architecture

Real-time streaming is implemented using Server-Sent Events (SSE):

1. **Request Processing**: Chat request is received and validated
2. **AI Service Call**: Appropriate AI provider service is selected
3. **Stream Generation**: Response is streamed token-by-token
4. **Client Updates**: Frontend receives real-time updates
5. **Message Storage**: Final response is stored in database

## Frontend Architecture

### State Management

Redux Toolkit is used for state management with the following slices:

- **Auth Slice**: User authentication state
- **Session Slice**: Chat session management
- **Message Slice**: Message storage and retrieval
- **UI Slice**: Interface state and preferences

### Component Hierarchy

```
App
├── Login/Register (Auth Pages)
└── Chat
    ├── Sidebar
    │   ├── User Profile
    │   ├── Provider Selector
    │   ├── Session List
    │   └── Search/Filter
    └── Chat Area
        ├── Message List
        ├── Message Input
        └── Streaming Display
```

### Responsive Design

- **Mobile-First**: Base styles for mobile devices
- **Breakpoints**: Responsive breakpoints at 768px
- **Sidebar**: Collapsible sidebar for mobile
- **Touch-Friendly**: Optimized for touch interactions

## Database Design

### Schema Overview

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- Sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES sessions(id),
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    tokens_used INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);
```

### Relationships

- **One-to-Many**: User → Sessions
- **One-to-Many**: Session → Messages
- **Cascade Deletes**: Deleting a session removes all messages

## Security Considerations

### Authentication

- JWT tokens with configurable expiration
- Password hashing using bcrypt
- Secure token storage in localStorage
- Automatic token refresh handling

### API Security

- CORS configuration for allowed origins
- Input validation using Pydantic schemas
- SQL injection prevention with SQLAlchemy
- Rate limiting considerations

### Data Privacy

- User data isolation
- Session-based message storage
- No persistent AI conversation logs
- Configurable data retention

## Performance Optimizations

### Backend

- Async/await for I/O operations
- Database connection pooling
- Efficient query patterns
- Streaming responses to reduce memory usage

### Frontend

- Redux state normalization
- Efficient re-rendering with React
- CSS-only animations
- Lazy loading considerations

### Database

- Proper indexing on foreign keys
- JSONB for flexible metadata
- Connection pooling
- Efficient query patterns

## Scalability Considerations

### Horizontal Scaling

- Stateless backend design
- Database connection pooling
- Redis for session storage (optional)
- Load balancer ready

### Vertical Scaling

- Async processing
- Efficient memory usage
- Streaming responses
- Database optimization

## Monitoring and Logging

### Backend Logging

- Structured logging with FastAPI
- Error tracking and reporting
- Performance metrics
- Database query monitoring

### Frontend Monitoring

- Error boundary implementation
- Performance monitoring
- User interaction tracking
- Network request monitoring

## Deployment Considerations

### Environment Configuration

- Environment-specific settings
- Secure secret management
- Database migration handling
- Health check endpoints

### Containerization

- Docker support for backend
- Multi-stage builds
- Environment variable injection
- Health check integration

### CI/CD

- Automated testing
- Database migration scripts
- Environment deployment
- Rollback procedures
