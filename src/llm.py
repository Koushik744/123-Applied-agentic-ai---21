import sys
from google import genai
from google.genai import types
from src.config import GEMINI_API_KEY, MODEL_NAME, GENERATION_CONFIG


def _get_client() -> genai.Client:
    if not GEMINI_API_KEY:
        raise EnvironmentError(
            "GEMINI_API_KEY is missing.\n"
            "Please create a .env file and add: GEMINI_API_KEY=your_api_key_here\n"
            "See .env.example for reference."
        )
    return genai.Client(api_key=GEMINI_API_KEY)


def call_llm(prompt: str) -> str:
    """Send a prompt to the Gemini model and return the text response."""
    if not prompt or not prompt.strip():
        raise ValueError("Prompt cannot be empty.")

    client = _get_client()

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=GENERATION_CONFIG["temperature"],
                max_output_tokens=GENERATION_CONFIG["max_output_tokens"],
            ),
        )
    except Exception as e:
        error_str = str(e).lower()
        if any(k in error_str for k in ("api_key", "invalid", "401", "permission_denied", "unauthenticated")):
            raise PermissionError(
                "Invalid API key or permission denied.\n"
                "Please check your GEMINI_API_KEY value in the .env file."
            ) from e
        if any(k in error_str for k in ("quota", "429", "resource_exhausted")):
            raise RuntimeError(
                "API quota exceeded or rate limit reached.\n"
                "Please wait a moment and try again, or check your Gemini API quota at ai.google.dev."
            ) from e
        if any(k in error_str for k in ("network", "connection", "timeout", "unreachable")):
            raise ConnectionError(
                "Network error. Please check your internet connection and try again."
            ) from e
        raise RuntimeError(f"API call failed: {e}") from e

    if not response.text or not response.text.strip():
        raise RuntimeError("The model returned an empty response. Please try again.")

    return response.text.strip()
