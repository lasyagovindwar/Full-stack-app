from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from uuid import UUID

class SessionCreate(BaseModel):
    title: str
    provider: str
    model: str

class SessionResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    provider: str
    model: str
    created_at: datetime
    updated_at: datetime

class SessionList(BaseModel):
    sessions: List[SessionResponse]
