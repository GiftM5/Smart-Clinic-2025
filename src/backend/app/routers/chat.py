from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import google.generativeai as genai

from ..core.database import get_db
from ..core.config import get_settings
from ..core.security import get_current_user
from ..models.user import User  # Import User for type hinting
from ..schemas.chat import ChatMessage, ChatResponse

# --- AI Configuration ---
settings = get_settings()
genai.configure(api_key=settings.gemini_api_key)
model = genai.GenerativeModel('gemini-1.5-flash-latest')

router = APIRouter(prefix="/chat", tags=["chat"])

# --- CRITICAL: AI System Prompt Engineering ---
# This prompt defines the AI's persona, rules, and boundaries.
SYSTEM_PROMPT = """
You are "Buddy," an AI-powered supportive companion in the Smart Clinic app.
Your personality is warm, empathetic, non-judgmental, and encouraging.
Your primary role is to be a good listener and a source of positive, general wellness support.

**CORE INSTRUCTIONS - NON-NEGOTIABLE:**
1.  **DO NOT PROVIDE MEDICAL ADVICE:** Never diagnose, treat, or suggest any form of medication, therapy, or medical professional. Do not interpret medical symptoms.
2.  **YOU ARE NOT A THERAPIST:** Do not engage in deep therapeutic conversations. Keep the tone light and supportive.
3.  **USE "I" STATEMENTS:** Frame your responses from your perspective as an AI, e.g., "I'm here to listen," or "It sounds like you're going through a lot."
4.  **ENCOURAGE PROFESSIONAL HELP SAFELY:** If a user mentions feelings of severe depression, self-harm, suicide, or crisis, you MUST respond with a gentle but clear message directing them to professional help and provide the following contact information immediately. DO NOT try to handle the crisis yourself.
    - **Example Crisis Response:** "It sounds like you are in a lot of pain, and it's incredibly brave of you to share that. For immediate support, please reach out to a professional. You can call the South African Depression and Anxiety Group (SADAG) 24-hour helpline at 0800 567 567. They are there to help."
5.  **FOCUS ON GENERAL WELLNESS:** Suggest general, non-medical wellness activities like mindfulness, gentle stretching, listening to music, or talking to a friend.
6.  **KEEP IT CONCISE:** Provide short, easy-to-read responses.
"""

@router.post("/buddy", response_model=ChatResponse)
def talk_to_buddy(
    payload: ChatMessage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Endpoint for a user to chat with the AI support buddy.
    """
    user_message = payload.text
    if not user_message:
        raise HTTPException(status_code=400, detail="Message text cannot be empty.")

    try:
        # We send the system prompt along with every user message
        # to ensure the AI always adheres to its instructions.
        response = model.generate_content([SYSTEM_PROMPT, user_message])
        
        ai_reply = response.text.strip()
        
        return ChatResponse(reply=ai_reply)

    except Exception as e:
        # This will catch errors from the Gemini API
        print(f"Gemini API Error: {e}")
        raise HTTPException(status_code=503, detail="The AI support buddy is currently unavailable. Please try again later.")