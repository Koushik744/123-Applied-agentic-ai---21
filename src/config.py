import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Change this model name here if you want to use a different Gemini model.
MODEL_NAME = "gemini-2.0-flash"

GENERATION_CONFIG = {
    "temperature": 0.3,
    "max_output_tokens": 2048,
}
