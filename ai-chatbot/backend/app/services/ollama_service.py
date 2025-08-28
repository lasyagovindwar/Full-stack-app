import httpx
from typing import AsyncGenerator
from app.services.base_service import BaseAIService
from app.schemas.chat import StreamResponse
import uuid

class OllamaService(BaseAIService):
    def __init__(self, api_key: str = ""):
        super().__init__(api_key)
        self.base_url = "http://localhost:11434"
    
    async def get_available_models(self) -> list:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/tags")
                if response.status_code == 200:
                    data = response.json()
                    return [model["name"] for model in data.get("models", [])]
                return []
        except:
            return []
    
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
            
            # Convert messages to Ollama format
            user_message = messages[-1]["content"] if messages else ""
            
            # Stream response from Ollama
            async with httpx.AsyncClient() as client:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/api/generate",
                    json={
                        "model": model,
                        "prompt": user_message,
                        "stream": True
                    }
                ) as response:
                    full_content = ""
                    async for line in response.aiter_lines():
                        if line.strip():
                            try:
                                data = httpx.loads(line)
                                if "response" in data:
                                    content = data["response"]
                                    full_content += content
                                    yield StreamResponse(type="token", content=content)
                                if data.get("done", False):
                                    break
                            except:
                                continue
            
            # Send complete signal
            message_id = uuid.uuid4()
            yield StreamResponse(
                type="complete",
                message_id=message_id,
                content=full_content
            )
            
        except Exception as e:
            yield StreamResponse(type="error", error=str(e))
