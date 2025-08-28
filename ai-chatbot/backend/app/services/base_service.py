from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, Any
from app.schemas.chat import StreamResponse

class BaseAIService(ABC):
    """Base class for AI provider services"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    @abstractmethod
    async def stream_chat(
        self, 
        messages: list, 
        model: str, 
        **kwargs
    ) -> AsyncGenerator[StreamResponse, None]:
        """Stream chat response from AI provider"""
        pass
    
    @abstractmethod
    async def get_available_models(self) -> list:
        """Get list of available models for this provider"""
        pass
    
    @abstractmethod
    async def validate_model(self, model: str) -> bool:
        """Validate if a model is available for this provider"""
        pass
