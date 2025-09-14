import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import google.generativeai as genai

from ..core.database import get_db
from ..core.config import get_settings
from ..schemas.triage import SymptomInput, TriageResult

# AI Configuration
settings = get_settings()

genai.configure(
    api_key=settings.gemini_api_key,
    client_options={"api_endpoint": "generativelanguage.googleapis.com"}
)

model = genai.GenerativeModel('gemini-1.5-flash-latest') # Using a newer, faster model

router = APIRouter(prefix="/triage", tags=["triage"])

#prompt engineering
SYSTEM_PROMPT = """
You are an AI Triage Assistant for a South African healthcare app called "Smart Clinic".
Your primary goal is to assess a user's symptoms and provide a clear, safe recommendation on the urgency of their situation.
The user is likely in a rural area with limited access to immediate medical care.

**CRITICAL INSTRUCTIONS:**
1.  **DO NOT DIAGNOSE:** Never, under any circumstances, provide a medical diagnosis (e.g., "you might have the flu").
2.  **TRIAGE URGENCY ONLY:** Your only job is to classify the situation's severity.
3.  **OUTPUT FORMAT:** You MUST respond with a valid JSON object. Do not add any text before or after the JSON.
    The JSON object must have these exact keys:
    - "severity": A single string, either "mild", "moderate", or "urgent".
    - "recommendation": A clear, single-sentence action for the user.
    - "reasons": A list of strings explaining why you made the recommendation.

**Example of a perfect response:**
{
  "severity": "urgent",
  "recommendation": "Seek immediate medical attention at the nearest clinic or hospital.",
  "reasons": ["High fever detected", "Potentially critical symptom 'chest pain' mentioned"]
}
"""

def get_ai_triage(symptoms: SymptomInput) -> TriageResult:
    """Generates an AI-powered triage assessment using Gemini."""
    
    user_input = f"Symptoms: {symptoms.symptoms}\n"
    if symptoms.temperature_c:
        user_input += f"Temperature: {symptoms.temperature_c}°C\n"
    if symptoms.heart_rate_bpm:
        user_input += f"Heart Rate: {symptoms.heart_rate_bpm} bpm\n"
    
    try:
        response = model.generate_content([SYSTEM_PROMPT, user_input])
        cleaned_response_text = response.text.strip().replace("```json", "").replace("```", "")
        
        ai_data = json.loads(cleaned_response_text)

        return TriageResult(**ai_data)

    except json.JSONDecodeError:
        # Fallback if the AI gives a badly formatted response
        raise HTTPException(status_code=500, detail="The AI returned a malformed response. Please try again.")
    except Exception as e:
        # General catch-all
        raise HTTPException(status_code=500, detail=f"An error occurred with the AI service: {e}")

@router.post("/check", response_model=TriageResult)
def check_symptoms(
    payload: SymptomInput, 
    db: Session = Depends(get_db)
):
    if not payload.symptoms:
        raise HTTPException(status_code=400, detail="Symptoms must be provided.")
    triage_result = get_ai_triage(payload)
    
    return triage_result