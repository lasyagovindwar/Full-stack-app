import anthropic
from typing import AsyncGenerator
from app.services.base_service import BaseAIService
from app.schemas.chat import StreamResponse
import uuid

class AnthropicService(BaseAIService):
    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.client = anthropic.AsyncAnthropic(api_key=api_key)
    
    async def get_available_models(self) -> list:
        return [
            "claude-3-opus-20240229",
            "claude-3-sonnet-20240229",
            "claude-3-haiku-20240307"
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
            
            # Convert messages to Anthropic format
            system_message = ""
            user_messages = []
            
            for msg in messages:
                if msg["role"] == "system":
                    system_message = msg["content"]
                elif msg["role"] == "user":
                    user_messages.append(msg["content"])
                elif msg["role"] == "assistant":
                    user_messages.append(msg["content"])
            
            # Stream response from Anthropic
            stream = await self.client.messages.create(
                model=model,
                max_tokens=4096,
                messages=[{"role": "user", "content": " ".join(user_messages)}],
                system=system_message if system_message else None,
                stream=True,
                **kwargs
            )
            
            full_content = ""
            async for chunk in stream:
                if chunk.type == "content_block_delta":
                    content = chunk.delta.text
                    if content:
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
