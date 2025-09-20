from pydantic import BaseModel

class ChatMessage(BaseModel):
    text: str

class ChatResponse(BaseModel):
    reply: str