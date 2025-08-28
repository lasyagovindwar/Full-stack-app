from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.database import get_db, Message, Session, User
from app.schemas.messages import MessageCreate, MessageResponse, MessageList
from app.routers.auth import get_current_user
import uuid

router = APIRouter()

@router.get("/session/{session_id}", response_model=MessageList)
async def get_messages(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify session belongs to user
    session_result = await db.execute(
        select(Session).where(
            Session.id == session_id,
            Session.user_id == current_user.id
        )
    )
    session = session_result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get messages for session
    result = await db.execute(
        select(Message).where(Message.session_id == session_id).order_by(Message.created_at)
    )
    messages = result.scalars().all()
    
    return MessageList(
        messages=[
            MessageResponse(
                id=message.id,
                session_id=message.session_id,
                role=message.role,
                content=message.content,
                provider=message.provider,
                model=message.model,
                tokens_used=message.tokens_used,
                created_at=message.created_at,
                metadata=message.metadata
            )
            for message in messages
        ]
    )

@router.post("/", response_model=MessageResponse)
async def create_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify session belongs to user
    session_result = await db.execute(
        select(Session).where(
            Session.id == message_data.session_id,
            Session.user_id == current_user.id
        )
    )
    session = session_result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    message = Message(
        id=uuid.uuid4(),
        session_id=message_data.session_id,
        role=message_data.role,
        content=message_data.content,
        provider=message_data.provider,
        model=message_data.model,
        tokens_used=message_data.tokens_used,
        metadata=message_data.metadata
    )
    
    db.add(message)
    await db.commit()
    await db.refresh(message)
    
    return MessageResponse(
        id=message.id,
        session_id=message.session_id,
        role=message.role,
        content=message.content,
        provider=message.provider,
        model=message.model,
        tokens_used=message.tokens_used,
        created_at=message.created_at,
        metadata=message.metadata
    )
