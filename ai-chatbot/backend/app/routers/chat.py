from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import json
from app.database import get_db, Message, Session, User
from app.schemas.chat import ChatRequest, ChatResponse, StreamResponse
from app.routers.auth import get_current_user
from app.services import OpenAIService, AnthropicService, GeminiService, OllamaService
from app.core.config import settings
import uuid

router = APIRouter()

def get_ai_service(provider: str):
    """Get AI service based on provider"""
    if provider == "openai":
        return OpenAIService(settings.OPENAI_API_KEY)
    elif provider == "anthropic":
        return AnthropicService(settings.ANTHROPIC_API_KEY)
    elif provider == "google":
        return GeminiService(settings.GOOGLE_API_KEY)
    elif provider == "ollama":
        return OllamaService()
    else:
        raise HTTPException(status_code=400, detail="Unsupported provider")

@router.post("/stream")
async def stream_chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify session belongs to user
    session_result = await db.execute(
        select(Session).where(
            Session.id == request.session_id,
            Session.user_id == current_user.id
        )
    )
    session = session_result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get AI service
    try:
        ai_service = get_ai_service(request.provider)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Validate model
    if not await ai_service.validate_model(request.model):
        raise HTTPException(status_code=400, detail="Invalid model for provider")
    
    # Get conversation history
    messages_result = await db.execute(
        select(Message).where(Message.session_id == request.session_id).order_by(Message.created_at)
    )
    messages = messages_result.scalars().all()
    
    # Convert to AI service format
    ai_messages = []
    for msg in messages:
        ai_messages.append({
            "role": msg.role,
            "content": msg.content
        })
    
    # Add current user message
    ai_messages.append({
        "role": "user",
        "content": request.message
    })
    
    # Save user message
    user_message = Message(
        id=uuid.uuid4(),
        session_id=request.session_id,
        role="user",
        content=request.message,
        provider=request.provider,
        model=request.model
    )
    db.add(user_message)
    await db.commit()
    
    async def generate_stream():
        try:
            async for response in ai_service.stream_chat(ai_messages, request.model):
                # Save assistant message when complete
                if response.type == "complete":
                    assistant_message = Message(
                        id=response.message_id,
                        session_id=request.session_id,
                        role="assistant",
                        content=response.content,
                        provider=request.provider,
                        model=request.model
                    )
                    db.add(assistant_message)
                    await db.commit()
                
                # Yield SSE data
                yield f"data: {response.json()}\n\n"
                
        except Exception as e:
            error_response = StreamResponse(type="error", error=str(e))
            yield f"data: {error_response.json()}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        }
    )

@router.get("/providers")
async def get_providers():
    """Get available AI providers and models"""
    return {
        "openai": {
            "name": "OpenAI",
            "models": ["gpt-3.5-turbo", "gpt-3.5-turbo-16k", "gpt-4", "gpt-4-turbo-preview", "gpt-4-32k"]
        },
        "anthropic": {
            "name": "Anthropic Claude",
            "models": ["claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"]
        },
        "google": {
            "name": "Google Gemini",
            "models": ["gemini-pro", "gemini-pro-vision", "gemini-flash"]
        },
        "ollama": {
            "name": "Ollama (Local)",
            "models": ["llama2", "mistral", "codellama", "neural-chat"]
        }
    }
