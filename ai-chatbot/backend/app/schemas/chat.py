from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from uuid import UUID

class ChatRequest(BaseModel):
    session_id: UUID
    message: str
    provider: str
    model: str
    stream: bool = True

class ChatResponse(BaseModel):
    message_id: UUID
    content: str
    tokens_used: Optional[int] = None
    provider: str
    model: str

class StreamResponse(BaseModel):
    type: str  # start, token, complete, error
    content: Optional[str] = None
    message_id: Optional[UUID] = None
    tokens_used: Optional[int] = None
    error: Optional[str] = None
