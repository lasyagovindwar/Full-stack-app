import google.generativeai as genai
from typing import AsyncGenerator
from app.services.base_service import BaseAIService
from app.schemas.chat import StreamResponse
import uuid

class GeminiService(BaseAIService):
    def __init__(self, api_key: str):
        super().__init__(api_key)
        genai.configure(api_key=api_key)
        self.model = None
    
    async def get_available_models(self) -> list:
        return [
            "gemini-pro",
            "gemini-pro-vision",
            "gemini-flash"
        ]
    
    async def validate_model(self, model: str) -> bool:
        available_models = await self.get_available_models()
        return model in available_models
    
    async def stream_chat(
        self, 
        messages: list, 
        model: str, 
        **kwargs
    ) -> AsyncGenerator[StreamResponse, None]:
        try:
            # Send start signal
            yield StreamResponse(type="start", content="")
            
            # Get Gemini model
            gemini_model = genai.GenerativeModel(model)
            
            # Convert messages to Gemini format
            chat = gemini_model.start_chat(history=[])
            
            # Get user message (last message)
            user_message = messages[-1]["content"] if messages else ""
            
            # Stream response from Gemini
            response = chat.send_message(user_message, stream=True)
            
            full_content = ""
            for chunk in response:
                if chunk.text:
                    content = chunk.text
                    full_content += content
                    yield StreamResponse(type="token", content=content)
            
            # Send complete signal
            message_id = uuid.uuid4()
            yield StreamResponse(
                type="complete",
                message_id=message_id,
                content=full_content
            )
            
        except Exception as e:
            yield StreamResponse(type="error", error=str(e))
