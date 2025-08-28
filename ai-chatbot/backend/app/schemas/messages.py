from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID

class MessageCreate(BaseModel):
    session_id: UUID
    role: str
    content: str
    provider: str
    model: str
    tokens_used: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None

class MessageResponse(BaseModel):
    id: UUID
    session_id: UUID
    role: str
    content: str
    provider: str
    model: str
    tokens_used: Optional[int] = None
    created_at: datetime
    metadata: Optional[Dict[str, Any]] = None

class MessageList(BaseModel):
    messages: List[MessageResponse]
