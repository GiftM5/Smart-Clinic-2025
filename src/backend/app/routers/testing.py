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

class FailedTest(BaseModel):
    description: str

class AdaptiveFeedback(BaseModel):
    suggestion: str

# --- AI Configuration ---
settings = get_settings()
genai.configure(api_key=settings.gemini_api_key)
model = genai.GenerativeModel('gemini-1.5-flash-latest')
router = APIRouter(prefix="/testing", tags=["testing"])

# --- AI PROMPTS ---
TEST_SCRIPT_PROMPT = """
You are an expert QA Automation Engineer. Your task is to analyze the provided React component code and generate a complete, professional, and multi-case end-to-end test script using the specified framework.

**CORE REQUIREMENTS:**
1.  **GENERATE MULTIPLE TEST CASES:** The script must include several test cases covering the "happy path," negative scenarios (e.g., incorrect password, empty fields), and other relevant user interactions.
2.  **USE PROFESSIONAL PATTERNS:** When appropriate, use the Page Object Model (POM) by defining a class for the page and its selectors/actions. The class definition should be in the same file.
3.  **STRICT OUTPUT FORMATTING:**
    -   Your entire response MUST BE ONLY the code.
    -   Do include any explanations, introductions, or summaries.
    -   Do NOT add comments about why the code is good or what patterns you used.
    -   Do provide installation instructions.
    -   Your response must start directly with `import` or `/// <reference ...>` and end with the final closing brace `}` of the code.
"""

TEST_CASE_PROMPT = """
You are an AI Testing Assistant acting as an expert QA Analyst called "Adaptive Test Hacker".
Your task is to analyze the following feature description for the 'Smart Clinic' application and generate a comprehensive set of test cases.
The test cases must cover normal, edge, invalid, and security scenarios.
For each test case, include: The input used, the expected outcome, and a brief "Why it matters for testers" section.
Format your entire response in Markdown. Use headings for each category.
"""

ADAPTIVE_FEEDBACK_PROMPT = """
You are an AI system called "Adaptive Test Hacker."
A simulated test has just failed. Your task is to provide a single, new, and insightful test case suggestion to investigate the failure further.
Your response should be a single sentence. Be creative and think like a hacker.
"""

# --- Endpoints ---
@router.post("/generate-script", response_model=TestScript)
def generate_e2e_script(payload: CodeSnippet, current_user: dict = Depends(get_current_user)):
    if not payload.code: raise HTTPException(status_code=400, detail="Code snippet cannot be empty.")
    try:
        user_prompt = f"Framework: {payload.framework}\n\nReact Component Code:\n```jsx\n{payload.code}\n```"
        response = model.generate_content([TEST_SCRIPT_PROMPT, user_prompt])
        cleaned_script = response.text.strip().replace("```javascript", "").replace("```", "").strip()
        return TestScript(script=cleaned_script)
    except Exception as e: raise HTTPException(status_code=500, detail=f"Failed to generate test script: {str(e)}")

@router.post("/generate-cases", response_model=TestCases)
def generate_test_cases(payload: FeatureDescription, current_user: dict = Depends(get_current_user)):
    if not payload.description: raise HTTPException(status_code=400, detail="Feature description cannot be empty.")
    try:
        response = model.generate_content([TEST_CASE_PROMPT, payload.description])
        return TestCases(cases=response.text.strip())
    except Exception as e: raise HTTPException(status_code=500, detail=f"Failed to generate test cases: {str(e)}")

@router.post("/adaptive-feedback", response_model=AdaptiveFeedback)
def get_adaptive_feedback(payload: FailedTest, current_user: dict = Depends(get_current_user)):
    if not payload.description: raise HTTPException(status_code=400, detail="Failed test description cannot be empty.")
    try:
        prompt = f"The following test failed: '{payload.description}'. What new test should I try next?"
        response = model.generate_content([ADAPTIVE_FEEDBACK_PROMPT, prompt])
        return AdaptiveFeedback(suggestion=response.text.strip())
    except Exception as e: raise HTTPException(status_code=500, detail=f"Failed to get adaptive feedback: {str(e)}")