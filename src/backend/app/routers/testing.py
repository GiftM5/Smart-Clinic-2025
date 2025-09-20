from fastapi import APIRouter, Depends, HTTPException
import google.generativeai as genai
from ..core.config import get_settings
from ..core.security import get_current_user
from pydantic import BaseModel, Field
from typing import Literal

# --- Pydantic Models ---
class CodeSnippet(BaseModel):
    code: str
    framework: Literal["playwright", "cypress"] = Field(default="playwright")

class TestScript(BaseModel):
    script: str

class FeatureDescription(BaseModel):
    description: str

class TestCases(BaseModel):
    cases: str

# --- AI Configuration ---
settings = get_settings()
genai.configure(api_key=settings.gemini_api_key)
model = genai.GenerativeModel('gemini-1.5-flash-latest')

router = APIRouter(prefix="/testing", tags=["testing"])

# --- AI PROMPTS ---
TEST_SCRIPT_PROMPT = """You are an expert QA Automation Engineer... (Your existing script prompt is perfect here, no changes needed)"""
TEST_CASE_PROMPT = """
You are an AI Testing Assistant acting as an expert QA Analyst.
Your task is to analyze the following feature description for the 'Smart Clinic' application and generate a comprehensive set of test cases.

The test cases must cover the following scenarios:
- Positive (Happy Path)
- Negative (Error handling)
- Boundary (Testing the limits)
- Security (Checking for vulnerabilities)

Format your entire response in Markdown. Use headings for each category.
"""

# --- ENDPOINT 1: GENERATE TEST SCRIPT FROM CODE (Existing) ---
@router.post("/generate-script", response_model=TestScript)
def generate_e2e_script(payload: CodeSnippet, current_user: dict = Depends(get_current_user)):
    # ... (The code for this function is perfect as it is, just rename the endpoint)
    # Make sure to use TEST_SCRIPT_PROMPT here.
    if not payload.code:
        raise HTTPException(status_code=400, detail="Code snippet cannot be empty.")
    try:
        user_prompt = f"Framework: {payload.framework}\n\nReact Component Code:\n```jsx\n{payload.code}\n```"
        response = model.generate_content([TEST_SCRIPT_PROMPT, user_prompt])
        cleaned_script = response.text.strip().replace("```javascript", "").replace("```", "").strip()
        return TestScript(script=cleaned_script)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate test script: {str(e)}")


# --- ENDPOINT 2: GENERATE TEST CASES FROM DESCRIPTION (New) ---
@router.post("/generate-cases", response_model=TestCases)
def generate_test_cases(payload: FeatureDescription, current_user: dict = Depends(get_current_user)):
    if not payload.description:
        raise HTTPException(status_code=400, detail="Feature description cannot be empty.")
    try:
        response = model.generate_content([TEST_CASE_PROMPT, payload.description])
        return TestCases(cases=response.text.strip())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate test cases: {str(e)}")