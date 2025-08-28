import openai
from typing import AsyncGenerator
from app.services.base_service import BaseAIService
from app.schemas.chat import StreamResponse
import uuid

class OpenAIService(BaseAIService):
    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.client = openai.AsyncOpenAI(api_key=api_key)
    
    async def get_available_models(self) -> list:
        return [
            "gpt-3.5-turbo",
            "gpt-3.5-turbo-16k", 
            "gpt-4",
            "gpt-4-turbo-preview",
            "gpt-4-32k"
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
            
            # Stream response from OpenAI
            stream = await self.client.chat.completions.create(
                model=model,
                messages=messages,
                stream=True,
                **kwargs
            )
            
            full_content = ""
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
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
